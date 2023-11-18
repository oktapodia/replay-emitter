class EventHandler {
  constructor(public time: number, public event: string, public args: any[]) {
  }

  toString() {
    return `${this.time.toFixed(0)}\t${this.event}\t${JSON.stringify(this.args)}`
  }
}

export default EventHandler;
