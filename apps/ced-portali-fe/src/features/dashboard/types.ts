export interface DashboardStat {
  id: string;
  label: string;
  value: string;
}

export interface DashboardResponse {
  items: DashboardStat[];
}
