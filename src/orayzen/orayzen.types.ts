export interface OrayzenGoal {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk';
  progress: number;
  dueDate: string;
}

export interface OrayzenKpi {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on_track' | 'at_risk' | 'off_track';
}

export interface OrayzenInitiative {
  id: string;
  title: string;
  status: 'planned' | 'active' | 'completed' | 'paused';
  owner: string;
  dueDate: string;
}
