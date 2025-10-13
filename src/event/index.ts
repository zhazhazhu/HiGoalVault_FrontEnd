import type { Emitter, EventType } from 'mitt'
import mitt from 'mitt'

export interface Events extends Record<EventType, unknown> {
  changeChat: string
}

const emitter: Emitter<Events> = mitt<Events>()

export { emitter }

export default emitter
