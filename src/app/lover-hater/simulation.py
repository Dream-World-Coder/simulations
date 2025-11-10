import random
from collections import deque
from typing import List, Dict, Optional, Tuple

class Pipe:
  def __init__(self, pid: int, child_pid: int, message: List[int] = []):
    # child_pid should be present in process.childrens, else pipe not possible
    if message is None:
      message = []
    self.message = deque(message)
    self.pid = pid
    self.child_pid = child_pid

  def read(self) -> List[int]:
    msgs = list(self.message)
    self.message.clear()
    return msgs

  def write(self, msg: int) -> None:
    self.message.append(msg)


class Process:
  probability: float = 0.37

  def __init__(self, pid: int, ppid: int, generation: int):
    self.pid = pid
    self.ppid = ppid
    self.generation = generation
    self.childrens: List[int] = []
    self.pipes: Dict[int, Pipe] = {}  # child_pid -> Pipe
    self.parent_pipe: Optional[Pipe] = None
    self.type = "lover" if random.random() < self.probability else "hater"

  def create_child(self, child_pid: int) -> 'Process':
    child = Process(child_pid, self.pid, self.generation + 1)
    self.childrens.append(child_pid)
    # parent creates pipe for child to write into
    pipe = Pipe(self.pid, child_pid)
    self.pipes[child_pid] = pipe
    child.parent_pipe = pipe
    return child

  def read_parents_msg(self) -> List[int]:
    if self.parent_pipe is None:
      return []
    return self.parent_pipe.read()

  def send_msg_to_parent(self, msg: int = 831) -> None:
    if self.parent_pipe is not None:
      self.parent_pipe.write(msg)


class HaterProcess(Process):
  min_childs:int = 1
  max_childs:int = 2

  def execute(self, all_processes: Dict[int, Process], steps: List[str]) -> Tuple[bool, bool]:
    """
    Returns: (changed_type, should_continue)
    """
    changed = False
    # 1. Read parent's messages (if any)
    parent_msgs = self.read_parents_msg()
    if parent_msgs:
      steps.append(f"Process {self.pid} (hater) received love from parent, becoming lover")
      self.type = "lover"
      changed = True
      # Send love to all children
      for child_pid in self.childrens:
        if child_pid in self.pipes:
          self.pipes[child_pid].write(831)
          steps.append(f"Process {self.pid} sent love (831) to child {child_pid}")
      return changed, False  # no further action this step

    # 2. If no children: create 2-4 children
    if not self.childrens:
      num_children = random.randint(HaterProcess.min_childs, HaterProcess.max_childs)
      steps.append(f"Process {self.pid} (hater) creating {num_children} children")
      for _ in range(num_children):
        child_pid = max(all_processes.keys()) + 1 if all_processes else self.pid + 1
        child = self.create_child(child_pid)
        all_processes[child_pid] = child
        child_type = "lover" if child.type == "lover" else "hater"
        steps.append(f"Child {child_pid} created as {child_type}, generation {child.generation}")

    # 3. Check messages from children
    child_msgs = []
    for child_pid in self.childrens:
      if child_pid in all_processes:
        child = all_processes[child_pid]
        if child.type == "lover" and child.parent_pipe is not None:
          msgs = child.parent_pipe.read()
          child_msgs.extend(msgs)
          if msgs:
            steps.append(f"Process {self.pid} received love (831) from child {child_pid}")

    if child_msgs:
      steps.append(f"Process {self.pid} (hater) received love from child, becoming lover")
      self.type = "lover"
      changed = True
      # Send love to every child
      for child_pid in self.childrens:
        if child_pid in self.pipes:
          self.pipes[child_pid].write(831)
          steps.append(f"Process {self.pid} sent love (831) to child {child_pid}")
      return changed, False

    # 4. If no messages: wait for children to exit (i.e., become lover and send msg)
    # But in simulation, we just let them run
    return changed, True


class LoverProcess(Process):
  def execute(self, all_processes: Dict[int, Process], steps: List[str]) -> Tuple[bool, bool]:
    """
    Lover: send love to parent, then stop
    Returns: (sent_message, should_continue)
    """
    if self.parent_pipe is not None:
      # Check if already sent
      if not any(m == 831 for m in self.parent_pipe.message):
        self.send_msg_to_parent(831)
        steps.append(f"Process {self.pid} (lover) sent love (831) to parent {self.ppid}")
        return True, False
    return False, False  # already done


def start_simulation() -> int:
  steps: List[str] = []
  all_processes: Dict[int, Process] = {}

  # Start with root process: pid 1, ppid 0, generation 0
  root = Process(1, 0, 0)
  all_processes[1] = root
  root_type = "lover" if root.type == "lover" else "hater"
  steps.append(f"Root process 1 created as {root_type}, generation 0")

  active_processes = [1]
  max_generation = 0

  while active_processes:
    current_pid = active_processes[0]
    proc = all_processes[current_pid]

    max_generation = max(max_generation, proc.generation)

    changed = False
    should_continue = True

    if proc.type == "hater":
      hater_proc = HaterProcess(proc.pid, proc.ppid, proc.generation)
      # Copy state
      hater_proc.childrens = proc.childrens[:]
      hater_proc.pipes = proc.pipes.copy()
      hater_proc.parent_pipe = proc.parent_pipe
      changed, should_continue = hater_proc.execute(all_processes, steps)
      # Update original
      proc.type = hater_proc.type
      proc.childrens = hater_proc.childrens
      proc.pipes = hater_proc.pipes
    else:
      lover_proc = LoverProcess(proc.pid, proc.ppid, proc.generation)
      lover_proc.parent_pipe = proc.parent_pipe
      sent, should_continue = lover_proc.execute(all_processes, steps)

    if not should_continue:
      active_processes.pop(0)
    else:
      # Rotate to back to give others chance
      active_processes.append(active_processes.pop(0))

    # Adding new children to active list
    for child_pid in proc.childrens:
      if child_pid not in active_processes and child_pid in all_processes:
        active_processes.append(child_pid)

    # break if many steps
    if len(steps) > 10000:
      steps.append("Simulation terminated: too many steps")
      break

  # Final steps
  lover_count = sum(1 for p in all_processes.values() if p.type == "lover")
  steps.append(f"Simulation complete. All {lover_count} processes are lovers.")
  steps.append(f"Maximum generation reached: {max_generation}")

  # Print all steps
  for step in steps:
    print(step)

  return max_generation


if __name__ == "__main__":
  max_gen = start_simulation()
  print(f"\nFinal max generation: {max_gen}")
