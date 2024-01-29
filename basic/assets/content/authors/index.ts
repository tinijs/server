import {Statuses} from '../types';

export interface Author {
  id: string;
  slug: string;
  status: Statuses;
  avatar: string;
  name: string;
  description: string;
  created: string;
  email?: string;
  url?: string;
  content: string;
}
