export class DashboardController {
  constructor(model, setApplicantsCallback) {
    this.model = model;
    this.setApplicants = setApplicantsCallback;
  }

  handleUpdateStatus(id, newStatus) {
    const updated = this.model.updateStatus(id, newStatus);
    this.setApplicants([...updated]);
  }

  handleAddJob(jobTitle) {
    if (!jobTitle) return;
    const updated = this.model.addJob(jobTitle);
    this.setApplicants([...updated]);
  }
}