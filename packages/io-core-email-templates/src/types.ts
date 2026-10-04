/** SESv2 `CreateEmailTemplate` request shape (`TemplateContent` + `TemplateName`). */
export interface SesEmailTemplate {
  readonly TemplateContent: {
    readonly Html: string;
    readonly Subject: string;
    readonly Text: string;
  };
  readonly TemplateName: string;
}
