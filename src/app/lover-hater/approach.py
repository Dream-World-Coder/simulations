# simulating pipe for proper os like communication [only through parent & child]
class Pipe:
  def __init__(self, pid:int, child_pid:int, message:list[int] = []):
    # child_pid should be present in process.childrens, else pipe not possible
    self.messaage = message # or use queue

  def read(self):
    pass

  def write(self):
    pass


# processes
class Process:
  probablity:float = 0.37

  # here lover / hater is an attribute alongside behaviour only for coloring / animation. all other stuff same logic as OS
  def __init__(self):
    self.pid
    self.ppid
    self.type # lover / hater [generate a random no, if < self.probablity the lover else hater. determine based on probablity]

    # addtional
    self.childrens
    self.generation # parent + 1

  def create_child(self):
    pass

  def read_parents_msg(self):
    # read message from pipe
    pass

  def send_msg_to_parent(self):
    # write message in pipe
    pass


class HaterProcess(Process):
  # read its parents messages, if not any then:
  # create 2-4 child, add pipe for each of them to communicate respectively
  # then look for any messages sent by its child processes,
  # [if all childs are hater then no msg will be present, else if some child becomes lover it will send love message 831]
  # now, if no msgs: wait for its child to exit, like sys.wait() does
  # else if msg present: then send love message to every child [not only ~hater~ childs cuz in os it cannot be determined], then change own type to lover.
  pass

class LoverProcess(Process):
  # do not create any child
  # send love message: 831 to parent
  # exit : here just stay stop, nothing else
  pass


def start_simulation():
  # recursively start child creation, and follow each step of the child as mentioned in the classes
  # start simulation, write each step or better store in steps array,
    # like root process, pid 1, created child ..., child with pid ... has become lover / hater, ... all children becomes lover
    # that is every minute step
  # after a certain time all processes will be Lover
  # then return the max generation of the created processes
  pass
