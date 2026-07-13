import type { Request, Response } from 'express'

import getUsers from '../../database/getUsers.js'
import updateUser from '../../database/updateUser.js'
import type { DatabaseUser } from '../../types/record.types.js'

export type DoToggleUserPermissionResponse =
  | { message: string; success: false }
  | { message: string; success: true; users: DatabaseUser[] }

export default function handler(
  request: Request,
  response: Response<DoToggleUserPermissionResponse>
): void {
  const { userName, permissionField } = request.body

  if (!userName || !permissionField) {
    response.status(400).json({
      success: false,

      message: 'User name and permission field are required'
    })
    return
  }

  const validPermissions = [
    'isActive',
    'canUpdateCemeteries',
    'canUpdateContracts',
    'canUpdateWorkOrders',
    'isAdmin'
  ]

  if (!validPermissions.includes(permissionField)) {
    response.status(400).json({
      success: false,
      message: 'Invalid permission field'
    })
    return
  }

  try {
    // Get current user data
    const users = getUsers()
    const currentUser = users.find((u) => u.userName === userName)

    if (!currentUser) {
      response.status(404).json({
        success: false,

        message: 'User not found'
      })
      return
    }

    // Toggle the permission
    const updateForm = {
      userName,

      isActive:
        permissionField === 'isActive'
          ? !currentUser.isActive
          : currentUser.isActive,

      canUpdateCemeteries:
        permissionField === 'canUpdateCemeteries'
          ? !currentUser.canUpdateCemeteries
          : currentUser.canUpdateCemeteries,
      canUpdateContracts:
        permissionField === 'canUpdateContracts'
          ? !currentUser.canUpdateContracts
          : currentUser.canUpdateContracts,
      canUpdateWorkOrders:
        permissionField === 'canUpdateWorkOrders'
          ? !currentUser.canUpdateWorkOrders
          : currentUser.canUpdateWorkOrders,
      isAdmin:
        permissionField === 'isAdmin'
          ? !currentUser.isAdmin
          : currentUser.isAdmin
    }

    const success = updateUser(updateForm, request.session.user as User)

    if (success) {
      const updatedUsers = getUsers()
      response.json({
        success: true,

        message: 'Permission updated successfully',
        users: updatedUsers
      })
    } else {
      response.status(404).json({
        success: false,

        message: 'User not found'
      })
    }
  } catch (error) {
    response.status(500).json({
      success: false,

      message:
        error instanceof Error ? error.message : 'Failed to update permission'
    })
  }
}
