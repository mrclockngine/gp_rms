import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { BaseComponent } from '../../../../../core/base.component';
import { StaffRole } from '../../../../../core/enums';
import { StaffUser } from '../../../../../core/interfaces';
import {
  AlertService,
  GlobalLoadingBarService,
  StaffService,
} from '../../../../../core/services';
import { StaffRoleUtils } from '../../../../../core/utils';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
  ],
  templateUrl: './members-list.component.html',
  styleUrl: './members-list.component.scss',
})
export class MembersListComponent extends BaseComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private clipboard = inject(Clipboard);
  private alertService = inject(AlertService);
  private staffService = inject(StaffService);
  private globalLoadingBar = inject(GlobalLoadingBarService);

  readonly roles = [
    {
      label: 'Admin',
      value: StaffRole.Admin,
    },
    {
      label: 'Cashier',
      value: StaffRole.Cashier,
    },
    {
      label: 'Waiter',
      value: StaffRole.Waiter,
    },
    {
      label: 'Kitchen Manager',
      value: StaffRole.KitchenManager,
    },
  ];

  activeRole = signal('');
  private membersList: StaffUser[] = [];
  dataSource = new MatTableDataSource<StaffUser>([]);

  readonly displayedColumns: string[] = ['role', 'name', 'username', 'actions'];

  ngOnInit(): void {
    const memberList = this.activatedRoute.snapshot.data[
      'membersList'
    ] as StaffUser[];
    this.membersList = memberList;
    this.dataSource.data = this.membersList;
  }

  getRoleCount(role: string): number {
    return this.membersList.filter((member) => member.role === role).length;
  }

  setRole(role: string): void {
    this.activeRole.set(role);
    if (role) {
      this.dataSource.data = this.membersList.filter(
        (member) => member.role === role
      );
    } else {
      this.dataSource.data = this.membersList;
    }
  }

  getRoleName(role: string) {
    return StaffRoleUtils.getName(role as StaffRole);
  }

  copyUsername(username: string): void {
    this.clipboard.copy(username);
    this.alertService.success(`Username "${username}" copied to clipboard.`);
  }

  deleteAccount(user: StaffUser) {
    this.sub$.sink = this.alertService
      .confirm({
        title: `Are you sure?`,
        message: `You are going to delete the ${StaffRoleUtils.getName(
          user.role
        )} account of ${user.name}. This action cannot be undone.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
      })
      .pipe(filter((confirmed) => confirmed))
      .subscribe({
        next: () => {
          this.globalLoadingBar.startLoading();
          this.sub$.sink = this.staffService.deleteUser(user.id).subscribe({
            next: () => {
              this.membersList = this.membersList.filter(
                (member) => member.id !== user.id
              );
              this.dataSource.data = this.membersList;
              this.alertService.success(
                `${StaffRoleUtils.getName(user.role)} account of ${
                  user.name
                } deleted successfully.`
              );
              this.globalLoadingBar.stopLoading();
            },
            error: (err) => {
              this.alertService.error(err);
              this.globalLoadingBar.stopLoading();
            },
          });
        },
      });
  }
}
