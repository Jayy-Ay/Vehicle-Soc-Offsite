import type { Role } from './roles'

export type DemoUser = {
  id: string
  name: string
  email: string
  role: Role
  title: string
  password: string
}

export const demoUsers: DemoUser[] = [
  {
    id: 'demo-admin',
    name: 'Avery Chen',
    email: 'admin@soc.demo',
    role: 'admin',
    title: 'Security Administrator',
    password: 'admin123!',
  },
  {
    id: 'demo-manager',
    name: 'Jordan Patel',
    email: 'manager@soc.demo',
    role: 'manager',
    title: 'Regional SOC Manager',
    password: 'manager123!',
  },
  {
    id: 'demo-analyst',
    name: 'Riley Morgan',
    email: 'analyst@soc.demo',
    role: 'viewer',
    title: 'Security Analyst',
    password: 'analyst123!',
  },
]
