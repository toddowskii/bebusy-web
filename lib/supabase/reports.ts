import { supabase } from './client'

export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'inappropriate' | 'misinformation' | 'other'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'
export type ReportContentType = 'post' | 'comment' | 'message' | 'user'

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  content_type: ReportContentType
  content_id?: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  created_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
}

export interface CreateReportData {
  reported_user_id: string
  content_type: ReportContentType
  content_id?: string
  reason: ReportReason
  description?: string
}

/**
 * Create a new report
 */
export async function createReport(data: CreateReportData): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user has already reported this content
    let existingQuery = (supabase
      .from('reports') as any)
      .select('id')
      .eq('reporter_id', user.id)
      .eq('content_type', data.content_type)
      .eq('reported_user_id', data.reported_user_id)
      .eq('status', 'pending')

    if (data.content_id) {
      existingQuery = existingQuery.eq('content_id', data.content_id)
    } else {
      existingQuery = existingQuery.is('content_id', null)
    }

    const { data: existingReport } = await existingQuery.single()

    if (existingReport) {
      return { success: false, error: 'You have already reported this content' }
    }

    const { error } = await (supabase
      .from('reports') as any)
      .insert({
        reporter_id: user.id,
        reported_user_id: data.reported_user_id,
        content_type: data.content_type,
        content_id: data.content_id,
        reason: data.reason,
        description: data.description,
        status: 'pending'
      })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error creating report:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all reports (admin only)
 */
export async function getReports(status?: ReportStatus): Promise<Report[]> {
  try {
    let query = (supabase
      .from('reports') as any)
      .select(`
        *,
        reporter:profiles!reporter_id(id, username, full_name, avatar_url),
        reported_user:profiles!reported_user_id(id, username, full_name, avatar_url),
        resolver:profiles!resolved_by(id, username, full_name)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as any || []
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return []
  }
}

/**
 * Get reports for a specific content item (admin only)
 */
export async function getContentReports(contentType: ReportContentType, contentId: string): Promise<Report[]> {
  try {
    const { data, error } = await (supabase
      .from('reports') as any)
      .select(`
        *,
        reporter:profiles!reporter_id(id, username, full_name, avatar_url),
        reported_user:profiles!reported_user_id(id, username, full_name, avatar_url)
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any || []
  } catch (error: any) {
    console.error('Error fetching content reports:', error)
    return []
  }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.role === 'admin'
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    const updateData: any = {
      status,
      resolved_by: user.id,
      resolved_at: new Date().toISOString()
    }

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes
    }

    const { error } = await (supabase
      .from('reports') as any)
      .update(updateData)
      .eq('id', reportId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating report:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's own reports
 */
export async function getMyReports(): Promise<Report[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await (supabase
      .from('reports') as any)
      .select(`
        *,
        reported_user:profiles!reported_user_id(id, username, full_name, avatar_url)
      `)
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as any || []
  } catch (error: any) {
    console.error('Error fetching my reports:', error)
    return []
  }
}

/**
 * Delete a report (admin only)
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.role === 'admin'
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    const { error } = await (supabase
      .from('reports') as any)
      .delete()
      .eq('id', reportId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting report:', error)
    return { success: false, error: error.message }
  }
}
