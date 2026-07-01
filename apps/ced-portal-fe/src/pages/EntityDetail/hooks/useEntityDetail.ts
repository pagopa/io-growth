import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { APP_ROUTES } from '../../../app/routeConfig';
import { useToast } from '../../../contexts';
import {
  useCompleteOnboardingMutation,
  useGetContractSignedMutation,
  useGetDepartmentOnboardingQuery,
} from '../../../features/entities/api';
import {
  getEntityFields,
  getEntityName,
  getGeographicFields,
  getLegalRepresentativeFields,
} from '../utils';
import type { UploadState } from '../../../components';

export function useEntityDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const {
    data: onboarding,
    isLoading,
    isError,
    refetch,
  } = useGetDepartmentOnboardingQuery(id ?? skipToken);

  const [getContractSigned, { isLoading: isDownloadingContract }] =
    useGetContractSignedMutation();
  const [completeOnboarding, { isLoading: isCompletingOnboarding }] =
    useCompleteOnboardingMutation();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const handleDownloadContract = async () => {
    if (!id) return;
    try {
      const blob = await getContractSigned({ onboardingId: id }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contratto-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Errore durante il download del contratto', 'error');
    }
  };

  const handleApprove = async () => {
    if (!id || !uploadedFile) return;
    try {
      await completeOnboarding({
        onboardingId: id,
        contract: uploadedFile,
      }).unwrap();
      setOpenPublishModal(false);
      showToast('Ente approvato con successo', 'success');
      navigate(APP_ROUTES.ENTITIES);
    } catch {
      showToast('Errore durante l’approvazione della richiesta', 'error');
    }
  };

  const handlePublish = () => {
    if (!uploadedFile || uploadState !== 'success') {
      showToast(
        'Carica la richiesta di convenzionamento controfirmata prima di approvare',
        'error',
      );
      return;
    }
    setOpenPublishModal(true);
  };

  const entityName = getEntityName(onboarding);
  const entityFields = getEntityFields(onboarding);
  const geographicFields = getGeographicFields(onboarding);
  const legalRepresentativeFields = getLegalRepresentativeFields(onboarding);

  const isEditable = onboarding?.status === 'PENDING_IN_REVIEW';

  return {
    entity: {
      onboarding,
      name: entityName,
      fields: entityFields,
      geographicFields,
      legalRepresentativeFields,
      isEditable,
    },
    upload: {
      state: uploadState,
      setState: setUploadState,
      file: uploadedFile,
      setFile: setUploadedFile,
    },
    actions: {
      downloadContract: handleDownloadContract,
      approve: handleApprove,
      publish: handlePublish,
      refetch,
    },
    modals: {
      publish: {
        open: openPublishModal,
        setOpen: setOpenPublishModal,
      },
      reject: {
        open: openRejectModal,
        setOpen: setOpenRejectModal,
      },
    },
    status: {
      isLoading,
      isError,
      isDownloadingContract,
      isCompletingOnboarding,
    },
  };
}

export default useEntityDetail;
