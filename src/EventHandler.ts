class EventHandler {
  constructor(public time: number, public event: string, public args: any[]) {
  }

  formatter(key: string, value: any){
      if (typeof value === 'bigint') {
        return value.toString()
      }

      return value;
  }

  toString() {
    return `${this.time.toFixed(0)}\t${this.event}\t${JSON.stringify(this.args, this.formatter)}`
  }
}

export default EventHandler;
