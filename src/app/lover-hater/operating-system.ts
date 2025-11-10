"use client";

// OS components

class Pipe {
  message: number[] = [];
  pid: number;
  childPid: number;

  constructor(pid: number, childPid: number, message: number[] = []) {
    this.pid = pid;
    this.childPid = childPid;
    this.message = [...message];
  }

  read(): number[] {
    const msgs = [...this.message];
    this.message = [];
    return msgs;
  }

  write(msg: number): void {
    this.message.push(msg);
  }

  clone(): Pipe {
    const p = new Pipe(this.pid, this.childPid);
    p.message = [...this.message];
    return p;
  }
}

class Process {
  static probability: number = 0.37;

  pid: number;
  ppid: number;
  generation: number;
  childrens: number[] = [];
  pipes: Map<number, Pipe> = new Map();
  parentPipe: Pipe | null = null;
  type: "lover" | "hater";

  constructor(pid: number, ppid: number, generation: number) {
    this.pid = pid;
    this.ppid = ppid;
    this.generation = generation;
    this.type = Math.random() < Process.probability ? "lover" : "hater";
  }

  clone(): Process {
    const p = new Process(this.pid, this.ppid, this.generation);
    p.type = this.type;
    p.childrens = [...this.childrens];
    p.pipes = new Map();
    this.pipes.forEach((pipe, key) => {
      p.pipes.set(key, pipe.clone());
    });
    p.parentPipe = this.parentPipe ? this.parentPipe.clone() : null;
    return p;
  }

  createChild(childPid: number): Process {
    const child = new Process(childPid, this.pid, this.generation + 1);
    this.childrens.push(childPid);
    const pipe = new Pipe(this.pid, childPid);
    this.pipes.set(childPid, pipe);
    child.parentPipe = pipe;
    return child;
  }

  readParentsMsg(): number[] {
    if (!this.parentPipe) return [];
    return this.parentPipe.read();
  }

  sendMsgToParent(msg: number = 831): void {
    if (this.parentPipe) {
      this.parentPipe.write(msg);
    }
  }
}

class HaterProcess extends Process {
  static minChilds = 2;
  static maxChilds = 3;

  execute(
    allProcesses: Map<number, Process>,
    steps: string[],
  ): [boolean, boolean] {
    let changed = false;

    const parentMsgs = this.readParentsMsg();
    if (parentMsgs.length > 0) {
      steps.push(
        `Process ${this.pid} (hater) received love from parent, becoming lover`,
      );
      this.type = "lover";
      changed = true;

      for (const childPid of this.childrens) {
        const pipe = this.pipes.get(childPid);
        if (pipe) {
          pipe.write(831);
          steps.push(
            `Process ${this.pid} sent love (831) to child ${childPid}`,
          );
        }
      }
      return [changed, false];
    }

    if (this.childrens.length === 0) {
      const numChildren =
        Math.floor(
          Math.random() * (HaterProcess.maxChilds - HaterProcess.minChilds + 1),
        ) + HaterProcess.minChilds;
      steps.push(
        `Process ${this.pid} (hater) creating ${numChildren} children`,
      );

      for (let i = 0; i < numChildren; i++) {
        const maxPid = Math.max(...Array.from(allProcesses.keys()));
        const childPid = maxPid + 1;
        const child = this.createChild(childPid);
        allProcesses.set(childPid, child);
        const childType = child.type;
        steps.push(
          `Child ${childPid} created as ${childType}, generation ${child.generation}`,
        );
      }
    }

    const childMsgs: number[] = [];
    for (const childPid of this.childrens) {
      const child = allProcesses.get(childPid);
      if (child && child.type === "lover" && child.parentPipe) {
        const msgs = child.parentPipe.read();
        childMsgs.push(...msgs);
        if (msgs.length > 0) {
          steps.push(
            `Process ${this.pid} received love (831) from child ${childPid}`,
          );
        }
      }
    }

    if (childMsgs.length > 0) {
      steps.push(
        `Process ${this.pid} (hater) received love from child, becoming lover`,
      );
      this.type = "lover";
      changed = true;

      for (const childPid of this.childrens) {
        const pipe = this.pipes.get(childPid);
        if (pipe) {
          pipe.write(831);
          steps.push(
            `Process ${this.pid} sent love (831) to child ${childPid}`,
          );
        }
      }
      return [changed, false];
    }

    return [changed, true];
  }
}

class LoverProcess extends Process {
  execute(
    allProcesses: Map<number, Process>,
    steps: string[],
  ): [boolean, boolean] {
    if (this.parentPipe) {
      if (!this.parentPipe.message.includes(831)) {
        this.sendMsgToParent(831);
        steps.push(
          `Process ${this.pid} (lover) sent love (831) to parent ${this.ppid}`,
        );
        return [true, false];
      }
    }
    return [false, false];
  }
}

export { Pipe, Process, LoverProcess, HaterProcess };
