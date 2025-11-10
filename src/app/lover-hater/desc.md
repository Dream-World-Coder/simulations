## Question

```txt
There are two kinds of processes in a system - hater which infiltrates
hatred and lover which teaches love to everyone. Law of nature is, in
spite of all efforts of a hater, a child of it can become a lover with
probability p. And, when a child becomes lover, then the parent
changes its mind to be a lover. Further, the newly converted lover
teaches its children, which are already created, to become lover.
Write a program which starts with a hater process and terminates when
all processes become lovers. (1) Find the minimum value of p for which
all the processes become lover within a given number of generations.
(2) Find the minimum number of generations within which all the
processes become lover for a given p. Consider that a process can
produce minimum 2 children and maximum 4 children to its next
generation. (Hints: Once a lover is created, it does not fork any
child, but sends a message to its parent. The parent then sends
"love"; message to its children and parent. A hater can give
birth of processes of next generation after waiting for some time.)
```

## Solution

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

#define MAX_CHILD 4

// recursive func, with back propagation [move up]
int simulateNode(double p, int generation, int maxGen, int parentPipe) {
  if (generation > maxGen)
    return 0; // stop

  int children = 2 + rand() % MAX_CHILD;
  int lover = 0;
  int pipefd[children][2];
  char childStatus[children];

  // pipes for children
  for (int i = 0; i < children; i++)
    pipe(pipefd[i]);

  // fork children
  for (int i = 0; i < children; i++) {
    pid_t pid = fork();
    if (pid == 0) {
      close(pipefd[i][0]); // close read end in child
      int status = 0;

      // randomly become lover or recurse
      if ((double)rand() / RAND_MAX < p)
        status = 1; // child becomes lover
      else
        status = simulateNode(p, generation + 1, maxGen, pipefd[i][1]);

      // notify parent about child's status
      write(pipefd[i][1], status ? "l" : "h", 1);
      close(pipefd[i][1]);
      exit(0);
    }
  }

  // parent reads status from children
  for (int i = 0; i < children; i++) {
    close(pipefd[i][1]); // close write end in parent
    char c;
    read(pipefd[i][0], &c, 1);
    childStatus[i] = c;
    close(pipefd[i][0]);
    wait(NULL);
  }

  // check if any child is lover → parent becomes lover
  for (int i = 0; i < children; i++) {
    if (childStatus[i] == 'l') {
      lover = 1; // parent becomes lover due to child
      break;
    }
  }

  // if this node is lover, convert all hater children to lovers (sideways)
  if (lover) {
    for (int i = 0; i < children; i++) {
      if (childStatus[i] == 'h') {
        childStatus[i] = 'l';
      }
    }
  }

  // notify parent about this node's status
  if (parentPipe != -1)
    write(parentPipe, lover ? "l" : "h", 1);

  return lover;
}

int main() {
  srand(time(NULL));
  int choice;
  printf("(1) Find minimum p for which all processes become lover within a "
         "given generations.\n");
  printf("(2) Find minimum generations for all processes to become lover for a "
         "given p.\nEnter choice: ");
  scanf("%d", &choice);

  if (choice == 1) {
    int maxGen;
    printf("Enter number of generations: ");
    scanf("%d", &maxGen);
    double p;
    for (p = 0.05; p <= 1.0; p += 0.01) {
      int pipefd[2];
      pipe(pipefd);
      pid_t pid = fork();
      if (pid == 0) {
        close(pipefd[0]);
        int status = simulateNode(p, 1, maxGen, pipefd[1]);
        write(pipefd[1], status ? "l" : "h", 1);
        close(pipefd[1]);
        exit(0);
      } else {
        close(pipefd[1]);
        char c;
        read(pipefd[0], &c, 1);
        close(pipefd[0]);
        wait(NULL);
        if (c == 'l') {
          printf("Minimum probability for all to become lovers: %.2lf\n", p);
          return 0;
        }
      }
    }
    printf("Not possible within %d generations.\n", maxGen);
  } else if (choice == 2) {
    double p;
    int maxGen;
    printf("Enter probability: ");
    scanf("%lf", &p);
    printf("Enter maximum generations to try: ");
    scanf("%d", &maxGen);

    for (int g = 1; g <= maxGen; g++) {
      int pipefd[2];
      pipe(pipefd);
      pid_t pid = fork();
      if (pid == 0) {
        close(pipefd[0]);
        int status = simulateNode(p, 1, g, pipefd[1]);
        write(pipefd[1], status ? "l" : "h", 1);
        close(pipefd[1]);
        exit(0);
      } else {
        close(pipefd[1]);
        char c;
        read(pipefd[0], &c, 1);
        close(pipefd[0]);
        wait(NULL);
        if (c == 'l') {
          printf("All processes became lovers within %d generations.\n", g);
          return 0;
        }
      }
      printf("Generation %d: not all are lovers yet.\n", g);
    }
    printf("Could not reach all lovers within %d generations.\n", maxGen);

  } else {
    printf("Enter correct choice.\n");
  }

  return 0;
}
```
