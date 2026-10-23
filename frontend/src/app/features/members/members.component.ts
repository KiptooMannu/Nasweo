import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../core/services/member.service';
import { Member, NextOfKin, MemberImportResult } from '../../core/models/member.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-page">
      <!-- Header Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Registry &amp; Radar</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              300 Member Institutional Scope
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Member Registry &amp; Statutory Biodata</h1>
          <p class="text-xs text-slate-600 mt-0.5">Manage welfare organization membership, automated retirement dates (Scientists at 65, Non-scientists at 60), and next of kin allocations.</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openImportModal()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Import Member List</span>
          </button>
          <button (click)="openAddModal()" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Register New Staff</span>
          </button>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <svg class="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input [(ngModel)]="searchQuery" (input)="onSearch()" type="text"
                 placeholder="Search registry by payroll number, national ID, full name, or division..."
                 class="w-full pl-9 pr-3 py-2 rounded bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
        </div>

        <select [(ngModel)]="categoryFilter" (change)="onSearch()" class="px-3 py-2 rounded bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
          <option value="">All Cadres</option>
          <option value="SCIENTIST">Scientists (Mandatory Retirement at 65)</option>
          <option value="NON_SCIENTIST">Non-Scientists (Mandatory Retirement at 60)</option>
        </select>

        <select [(ngModel)]="statusFilter" (change)="onSearch()" class="px-3 py-2 rounded bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Membership</option>
          <option value="RETIRED">Honorably Retired</option>
          <option value="EXITED">Exited</option>
        </select>
      </div>

      <!-- Member Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs min-w-[760px]">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th class="py-2.5 px-4">Payroll</th>
                <th class="py-2.5 px-4">Staff Member</th>
                <th class="py-2.5 px-4">National ID</th>
                <th class="py-2.5 px-4">Cadre</th>
                <th class="py-2.5 px-4">Division</th>
                <th class="py-2.5 px-4">Age</th>
                <th class="py-2.5 px-4">Statutory Retirement</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let m of members" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ m.payrollNo }}</td>
                <td class="py-2.5 px-4 font-medium text-slate-900">{{ m.firstName }} {{ m.lastName }}</td>
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ m.nationalId }}</td>
                <td class="py-2.5 px-4">
                  <span [ngClass]="m.employmentCategory === 'SCIENTIST' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'" class="px-1.5 py-0.5 rounded text-[10px] font-mono border">
                    {{ m.employmentCategory === 'SCIENTIST' ? 'Scientist (65y)' : 'Staff (60y)' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-700">{{ m.department || 'General' }}</td>
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ m.currentAge }}y</td>
                <td class="py-2.5 px-4 font-mono text-amber-900 font-medium">
                  {{ m.retirementDate }} ({{ m.yearsToRetirement }}y)
                </td>
                <td class="py-2.5 px-4">
                  <span [ngClass]="m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'" class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border">
                    {{ m.status }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-right">
                  <button (click)="openEditModal(m)" class="px-2 py-0.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition font-mono text-[11px]">
                    Edit Record
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Member Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">{{ editMode ? 'Edit Member Biodata' : 'Register New NASWEO Member' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form (ngSubmit)="saveMember()" class="mt-4 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Payroll Number *</label>
                <input [(ngModel)]="currentMember.payrollNo" name="payrollNo" [disabled]="editMode" required placeholder="e.g. NARL-1004" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">National ID *</label>
                <input [(ngModel)]="currentMember.nationalId" name="nationalId" required placeholder="e.g. 23456789" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">First Name *</label>
                <input [(ngModel)]="currentMember.firstName" name="firstName" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Last Name *</label>
                <input [(ngModel)]="currentMember.lastName" name="lastName" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Phone Number *</label>
                <input [(ngModel)]="currentMember.phoneNumber" name="phoneNumber" required placeholder="+254700000000" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Email</label>
                <input [(ngModel)]="currentMember.email" name="email" type="email" placeholder="name@kalro.org" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Date of Birth *</label>
                <input [(ngModel)]="currentMember.dob" (change)="onDobOrCategoryChange()" name="dob" type="date" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Employment Category *</label>
                <select [(ngModel)]="currentMember.employmentCategory" (change)="onDobOrCategoryChange()" name="employmentCategory" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option value="SCIENTIST">Scientist (Mandatory Retirement at 65)</option>
                  <option value="NON_SCIENTIST">Non-Scientist (Mandatory Retirement at 60)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Department / Division</label>
                <input [(ngModel)]="currentMember.department" name="department" placeholder="e.g. Entomology, Soils, Accounts" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Station</label>
                <input [(ngModel)]="currentMember.station" name="station" placeholder="NARL Kabete" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <!-- Auto-Calculated Retirement Preview Notice -->
            <div *ngIf="retirementPreview" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <p class="font-bold">Automated Retirement Forecast:</p>
              <p>Projected statutory retirement date is <span class="font-extrabold underline">{{ retirementPreview }}</span> (based on statutory retirement age for {{ currentMember.employmentCategory }}).</p>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Save Member</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Excel Bulk Import Modal -->
      <div *ngIf="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-scale-in">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Import Members from Excel</h3>
            <button (click)="closeImportModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="mt-4 space-y-4 text-xs">
            <div class="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition">
              <input type="file" (change)="onFileSelected($event)" accept=".xlsx, .xls" class="hidden" #fileInput>
              <p class="text-slate-600 font-semibold mb-1">Upload Microsoft Excel Spreadsheet</p>
              <p class="text-[11px] text-slate-400 mb-3">Columns: PayrollNo, NationalId, FirstName, LastName, OtherNames, Email, Phone, DOB, Category, Department</p>
              <button (click)="fileInput.click()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700">Select File</button>
              <p *ngIf="selectedFile" class="mt-2 text-emerald-600 font-bold font-mono">{{ selectedFile.name }}</p>
            </div>

            <div *ngIf="importResult" class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p class="font-bold text-slate-800">Validation Result:</p>
              <p class="text-emerald-600">✓ Successful / Valid rows: {{ importResult.successfulRecords }}</p>
              <p class="text-rose-600">✕ Failed / Rejected rows: {{ importResult.failedRecords }}</p>
              <div *ngIf="importResult.errorMessages.length > 0" class="max-h-24 overflow-y-auto text-rose-500 text-[11px]">
                <div *ngFor="let err of importResult.errorMessages">{{ err }}</div>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button (click)="executeImport(true)" [disabled]="!selectedFile" class="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 disabled:opacity-50">Validate Only</button>
              <button (click)="executeImport(false)" [disabled]="!selectedFile" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white disabled:opacity-50">Commit &amp; Save</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  searchQuery = '';
  categoryFilter = '';
  statusFilter = '';
  showModal = false;
  editMode = false;
  showImportModal = false;
  selectedFile: File | null = null;
  importResult: MemberImportResult | null = null;
  retirementPreview = '';

  currentMember: Member = this.getEmptyMember();

  constructor(private memberService: MemberService) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.searchMembers(this.searchQuery, this.statusFilter, this.categoryFilter).subscribe(res => {
      this.members = res.data.content;
    });
  }

  onSearch() {
    this.loadMembers();
  }

  openAddModal() {
    this.editMode = false;
    this.currentMember = this.getEmptyMember();
    this.retirementPreview = '';
    this.showModal = true;
  }

  openEditModal(m: Member) {
    this.editMode = true;
    this.currentMember = { ...m };
    this.onDobOrCategoryChange();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onDobOrCategoryChange() {
    if (this.currentMember.dob && this.currentMember.employmentCategory) {
      const parts = this.currentMember.dob.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const addYears = this.currentMember.employmentCategory === 'SCIENTIST' ? 65 : 60;
        this.retirementPreview = `${year + addYears}-${parts[1]}-${parts[2]}`;
      }
    }
  }

  saveMember() {
    if (this.editMode && this.currentMember.id) {
      this.memberService.updateMember(this.currentMember.id, this.currentMember).subscribe(() => {
        this.closeModal();
        this.loadMembers();
      });
    } else {
      this.memberService.createMember(this.currentMember).subscribe(() => {
        this.closeModal();
        this.loadMembers();
      });
    }
  }

  openImportModal() {
    this.selectedFile = null;
    this.importResult = null;
    this.showImportModal = true;
  }

  closeImportModal() {
    this.showImportModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  executeImport(dryRun: boolean) {
    if (!this.selectedFile) return;
    this.memberService.importExcel(this.selectedFile, dryRun).subscribe(res => {
      this.importResult = res.data;
      if (!dryRun) {
        this.loadMembers();
      }
    });
  }

  private getEmptyMember(): Member {
    return {
      payrollNo: '',
      nationalId: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dob: '',
      employmentCategory: 'SCIENTIST',
      status: 'ACTIVE',
      station: 'NARL Kabete'
    };
  }
}
