import EntityTypes from './EntityTypes.mjs'

export default class Entity {
  static entityTypes = [EntityTypes.DEFAULT]

  constructor() {
    /**
     * @type {Map<EntityType, Function[]>}
     */
    this.interactionHandlers = new Map()
    /**
     * @type {Map<string, Record<string, any>>}
     */
    this.quirks = new Map()
  }

  /**
   * @param {EntityType[]} entityTypes
   * @param {(entity: Entity, ...args: any[]) => void} handler
   */
  addInteraction(entityTypes, handler) {
    for (const type of entityTypes) {
      if (!this.interactionHandlers.has(type)) {
        this.interactionHandlers.set(type, [])
      }
      this.interactionHandlers.get(type).push(handler)
    }
  }

  /**
   * @param {EntityType[]} entityTypes
   */
  removeInteraction(entityTypes) {
    for (const type of entityTypes) {
      this.interactionHandlers.delete(type)
    }
  }

  /**
   * @param {Entity} entity
   * @param {...any} args
   */
  interactWith(entity, ...args) {
    for (const type of entity.constructor.entityTypes) {
      const handlers = this.interactionHandlers.get(type)
      if (handlers) {
        for (const handler of handlers) {
          handler.call(this, entity, ...args)
        }
      }
    }
  }

  /**
   * @param {Object} params
   * @param {string} params.quirk
   * @param {Entity} params.source
   * @param {boolean} params.shouldHaveQuirk
   * @param {Record<string, any>} [params.context={}]
   */
  updateQuirkFromSource({ quirk, source, shouldHaveQuirk, context = {} }) {
    if (shouldHaveQuirk) {
      this.addQuirk(quirk, { source, ...context })
    } else if (this.quirks.get(quirk)?.source === source) {
      this.removeQuirk(quirk)
    }
  }

  /**
   * @param {string} quirk
   * @param {Record<string, any>} [context={}]
   */
  addQuirk(quirk, context = {}) {
    this.quirks.set(quirk, context)
  }

  /**
   * @param {string} quirk
   */
  removeQuirk(quirk) {
    this.quirks.delete(quirk)
  }

  /**
   * @param {string} quirk
   * @returns {boolean}
   */
  hasQuirk(quirk) {
    return this.quirks.has(quirk)
  }
}
