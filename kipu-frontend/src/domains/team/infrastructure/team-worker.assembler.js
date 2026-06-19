import { TeamWorkerEntity } from '../domain/model/team-worker.entity.js'

export class TeamWorkerAssembler {

    /**
     * Desde el JSON de C# hacia el Modelo de JS
     */
    static toEntityFromResource(resource) {
        const entity = new TeamWorkerEntity()
        entity.id = resource.id
        entity.dni = resource.dni

        // C# puede devolver "FullName" con F mayúscula por defecto si no hay policy
        entity.fullName = resource.fullName || resource.FullName
        entity.role = resource.role || resource.Role
        entity.isActive = resource.isActive !== undefined ? resource.isActive : resource.IsActive

        // Mapeo especial para Maquinarias: Extraemos solo los nombres
        const rawMachineries = resource.machineries || resource.Machineries || []
        entity.assignedTools = rawMachineries.map(m => m.fullName || m.FullName)

        entity.projectId = resource.projectId || resource.ProjectId || ''
        return entity
    }

    /**
     * Desde el Modelo de JS hacia el DTO de C# (CreateTeamWorkerResource)
     */
    static toCreateResourceFromEntity(entity, toolsList = []) {

        // C# espera una lista de objetos { MachineryId, FullName }
        const mappedMachineries = toolsList.map(t => ({
            machineryId: t.id,
            fullName: t.machineryName || t.fullName || 'Herramienta'
        }))

        return {
            dni: entity.dni,
            fullName: entity.fullName,
            // Split simple para mandar el apellido al backend como pide el DTO
            lastName: entity.fullName.split(' ').slice(1).join(' ') || 'Apellidos',
            role: entity.role,
            projectId: entity.projectId,
            machineries: mappedMachineries
        }
    }

    static toEntitiesFromResponse(response) {
        if (!Array.isArray(response)) return []
        return response.map(resource => this.toEntityFromResource(resource))
    }
}