import { belfioreConnector } from "@marketto/belfiore-connector-embedded";

import type {
  ApplicantData,
  ApplicantDataResolver,
} from "../../../application/ports/applicant-data-resolver.js";

// POC dependency: before production, replace this embedded catalog with an
// approved, versioned official dataset or complete the third-party risk review.
const OMOCODIA_DIGITS: Readonly<Record<string, string>> = {
  L: "0",
  M: "1",
  N: "2",
  P: "3",
  Q: "4",
  R: "5",
  S: "6",
  T: "7",
  U: "8",
  V: "9",
};

const MONTHS: Readonly<Record<string, number>> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  H: 6,
  L: 7,
  M: 8,
  P: 9,
  R: 10,
  S: 11,
  T: 12,
};

const decodeDigits = (value: string): null | number => {
  const normalized = [...value]
    .map((character) => OMOCODIA_DIGITS[character] ?? character)
    .join("");

  return /^\d+$/.test(normalized) ? Number(normalized) : null;
};

const resolveFullYear = (
  shortYear: number,
  month: number,
  day: number,
  currentDate: Date,
): number => {
  const currentYear = currentDate.getUTCFullYear();
  const currentCentury = Math.floor(currentYear / 100) * 100;
  const candidate = currentCentury + shortYear;
  const candidateDate = new Date(Date.UTC(candidate, month - 1, day));

  return candidateDate <= currentDate ? candidate : candidate - 100;
};

const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const decodeBirthData = (
  fiscalCode: string,
  currentDate: Date,
): Pick<ApplicantData, "dataNascita" | "sesso"> => {
  const normalizedFiscalCode = fiscalCode.toUpperCase();
  const shortYear = decodeDigits(normalizedFiscalCode.slice(6, 8));
  const month = MONTHS[normalizedFiscalCode[8] ?? ""];
  const encodedDay = decodeDigits(normalizedFiscalCode.slice(9, 11));

  if (shortYear === null || month === undefined || encodedDay === null) {
    return {};
  }

  const sesso = encodedDay > 40 ? "F" : "M";
  const day = sesso === "F" ? encodedDay - 40 : encodedDay;
  const year = resolveFullYear(shortYear, month, day, currentDate);

  if (!isValidDate(year, month, day)) {
    return {};
  }

  return {
    dataNascita: [
      String(year).padStart(4, "0"),
      String(month).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-"),
    sesso,
  };
};

const decodeBirthPlace = async (
  fiscalCode: string,
): Promise<
  Pick<
    ApplicantData,
    "comuneNascita" | "siglaProvinciaNascita" | "statoNascita"
  >
> => {
  const belfioreCode = fiscalCode.toUpperCase().slice(11, 15);
  const place = await belfioreConnector.findByCode(belfioreCode);

  if (!place) return {};

  if (place.province) {
    return {
      comuneNascita: place.name,
      siglaProvinciaNascita: place.province,
      statoNascita: "ITALIA",
    };
  }

  if (place.iso3166) {
    return {
      statoNascita: place.name,
    };
  }

  return {};
};

export const createFiscalCodeApplicantDataResolver = (
  now: () => Date = () => new Date(),
): ApplicantDataResolver => ({
  resolve: async ({ familyName, fiscalCode, givenName }) => {
    const birthPlace = await decodeBirthPlace(fiscalCode);

    return {
      cognome: familyName,
      nome: givenName,
      ...decodeBirthData(fiscalCode, now()),
      ...birthPlace,
    };
  },
});
