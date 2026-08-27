import { z } from 'zod'

export const campaignFormSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  description: z.string().min(4, 'Description is required'),
  agentId: z.string().min(1, 'Select an agent'),
  phoneNumberId: z.string().min(1, 'Select a phone number'),
  contactIds: z.array(z.string()).min(1, 'Select at least one contact'),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
  retryPolicy: z.coerce.number().min(0).max(5),
  callLimit: z.coerce.number().min(1).max(100000),
})

export type CampaignFormValues = z.infer<typeof campaignFormSchema>

export const defaultCampaignFormValues: CampaignFormValues = {
  name: '',
  description: '',
  agentId: '',
  phoneNumberId: '',
  contactIds: [],
  scheduleStart: '',
  scheduleEnd: '',
  retryPolicy: 2,
  callLimit: 100,
}
