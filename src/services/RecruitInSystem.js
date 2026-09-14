// ==========================================
// OOP MODEL: State & Business Logic Manager
// ==========================================
export class RecruitInSystem {
  constructor() {
    this.currentPage = 'home'; // 'home', 'register', 'dashboard'
    this.applicants = [
      { id: 1, name: "Andi Pratama", role: "Frontend Engineer", score: "95%", status: "Siap Wawancara", email: "andi@mail.com", phone: "08123456789" },
      { id: 2, name: "Siti Rahma", role: "UI/UX Designer", score: "91%", status: "Review AI", email: "siti@mail.com", phone: "08129876543" },
      { id: 3, name: "Budi Santoso", role: "Backend Developer", score: "88%", status: "Wawancara Selesai", email: "budi@mail.com", phone: "08134567890" },
      { id: 4, name: "Dewi Lestari", role: "Product Manager", score: "78%", status: "Cadangan / Pool", email: "dewi@mail.com", phone: "08156789012" },
    ];
  }

  addApplicant(newApplicant) {
    this.applicants = [newApplicant, ...this.applicants];
    return this.applicants;
  }

  updateApplicantStatus(id, status) {
    this.applicants = this.applicants.map(app => app.id === id ? { ...app, status } : app);
    return this.applicants;
  }
}