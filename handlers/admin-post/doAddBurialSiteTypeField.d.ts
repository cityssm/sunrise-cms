import type { Request, Response } from 'express';
import { type AddBurialSiteTypeFieldForm } from '../../database/addBurialSiteTypeField.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteTypeFieldForm>, response: Response): Promise<void>;
