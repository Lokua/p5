import EntityTypes from './EntityTypes.mjs'
import { QuirkModes } from './Quirks.mjs'

export default class Entity {
  static entityType = EntityTypes.DEFAULT

  constructor() {
    /**
     * @type {Map<EntityType, Function[]>}
     */
    this.interactionHandlers = new Map()
    /**
     * @type {Map<string, { context: Record<string, any>, enter?: Function, exit?: Function }>}
     */
    this.quirks = new Map()
  }

  /**
   * @param {EntityType} entityType
   * @param {(entity: Entity, ...args: any[]) => void} handler
   */
  addInteraction(entityType, handler) {
    if (!this.interactionHandlers.has(entityType)) {
      this.interactionHandlers.set(entityType, [])
    }
    this.interactionHandlers.get(entityType).push(handler)
  }

  /**
   * @param {EntityType} entityType
   */
  removeInteraction(entityType) {
    this.interactionHandlers.delete(entityType)
  }

  /**
   * @param {Entity} entity
   * @param {...any} args
   */
  interactWith(entity, ...args) {
    const handlers = this.interactionHandlers.get(entity.constructor.entityType)
    if (handlers) {
      for (const handler of handlers) {
        handler.call(this, entity, ...args)
      }
    }
  }

  /**
   * @param {Object} params
   * @param {string} params.quirk
   * @param {Entity} params.source
   * @param {boolean} params.shouldHaveQuirk
   * @param {Record<string, any>} [params.context={}]
   * @param {Function} [params.enter]
   * @param {Function} [params.update]
   * @param {Function} [params.exit]
   * @param {QuirkMode} [mode=QuirkModes.ADD_UPDATE_REMOVE]
   */
  updateQuirkFromSource({
    quirk,
    source,
    shouldHaveQuirk,
    context = {},
    enter,
    update,
    exit,
    mode = QuirkModes.ADD_UPDATE_REMOVE,
  }) {
    if (shouldHaveQuirk) {
      this.addQuirk({
        quirk,
        context: {
          source,
          ...context,
        },
        enter,
        update,
        exit,
      })
    } else if (
      mode === QuirkModes.ADD_UPDATE_REMOVE &&
      this.quirks.get(quirk)?.context?.source === source
    ) {
      this.removeQuirk(quirk)
    }

    if (
      this.hasQuirk(quirk) &&
      (shouldHaveQuirk || mode === QuirkModes.ADD_UPDATE_NO_REMOVE)
    ) {
      const storedQuirk = this.quirks.get(quirk)
      if (storedQuirk?.update) {
        storedQuirk.update.call(this, storedQuirk.context)
      }
    }
  }

  /**
   * @param {Object} params
   * @param {string} params.quirk
   * @param {Record<string, any>} [params.context={}]
   * @param {Function} [params.enter]
   * @param {Function} [params.update]
   * @param {Function} [params.exit]
   */
  addQuirk({ quirk, context = {}, enter, update, exit }) {
    if (!this.quirks.has(quirk)) {
      if (enter) {
        enter.call(this, context)
      }
      this.quirks.set(quirk, {
        context,
        enter,
        update,
        exit,
      })
    }
  }

  /**
   * @param {string} quirk
   */
  removeQuirk(quirk) {
    const { exit, context } = this.quirks.get(quirk) || {}
    if (exit) {
      exit.call(this, context)
    }
    this.quirks.delete(quirk)
  }

  removeAllQuirks() {
    this.quirks.clear()
  }

  /**
   * @param {string} quirk
   * @returns {boolean}
   */
  hasQuirk(quirk) {
    return this.quirks.has(quirk)
  }
}
