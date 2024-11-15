export default class Entity {
  constructor() {
    /**
     * @type {Map<Entity, (entity: Entity) => void>}
     */
    this.interactionHandlers = new Map()
  }

  /**
   * @param {Entity[]} entityTypes
   * @param {(entity: Entity) => void} handler
   */
  addInteraction(entityTypes, handler) {
    entityTypes.forEach((type) => {
      this.interactionHandlers.set(type, handler)
    })
  }

  /**
   * @param {Entity[]} entityTypes
   */
  removeInteraction(entityTypes) {
    entityTypes.forEach((type) => {
      this.interactionHandlers.delete(type)
    })
  }

  /**
   * @param {Entity} entity
   */
  interactWith(entity, ...args) {
    const handler = this.interactionHandlers.get(entity.constructor)
    if (handler) {
      handler.call(this, entity, ...args)
    }
  }
}
