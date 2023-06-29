Title: Level up your Python tooling - black, isort and other tools 
Date:   2022-12-08
Authors: Olaf Górski
Slug: tooling
Language: en
Description: Formatting and static analysis of python code and it's tooling. The lazy man’s approach to assuring Python code quality.

Formatting and static analysis of python code and it's tooling. The lazy man’s approach to assuring Python code quality.

Based on this article I also did a presentation - [Python (anti) Patterns 002 - Black, isort, bandit](https://github.com/grski/knowledge/blob/master/presentations/Black%2C%20isort%2C%20bandit%20and%20other%20tools.pdf)

## Pipelines

What are they and why do we need them

**Automating stuff? Pipelines to the rescue**

When we want to care about our Python code quality, we usually want to care about things like formatting, consistent import patterns, security and keeping our standars up to date. Ifwe want to do that in our repo/in the cloud automatically, we can use pipelines.

Pipelines are simply a set of steps that constitute our **CI/CD process.**

It’s more or less just a piece of code that does some steps for us. Usually pipelines are defined as a yaml file that definies what steps/actions we want to take as a part of our CI/CD process, meaning analysing, checking for quality, formatting of our code and building/deploying it.

In this presentation I’dlike to Focus on the steps related to automation of the quality assurance process of developing Python apps.

Most commonly known tools for this in the cloud include: **GitHub Actions, GitLab CI/CD, Bitbucket Pipelines, CircleCI, Azure DevOps.**

Usually these are the things that fire up when we for example create a merge/pull request, push some code to the repo, merge one branch into the other. They trigger various checks, builds, tests and what not.

The flow is like so:

Trigger is received (eg. Branch is pushed to the repo) -> pipeline is fired -> various checks are made -> based on that pipeline can fail or succeed

Other than pipelines being there up in the cloud, I consider some parts of them an integral part of local development too. Mostly the parts related to the stuff about quality control.

## **What makes a good code?**

Nowadays the trend in Python is to take care about certain things that while not crucial, over time contribute to the project’s quality, readability and maintanability.

On a high level, in my book, any piece of Python code can use some of:

1. Consistent formatting
1. Ordered imports that are split by sections
1. Absolute imports
1. Usage of modern standards that are compliant to latest standards
1. Lack of unused imports and variables
1. Security/vulnerability scans

Further on we will talk how to handle this in Python.

## Black

### **Few words on formatting and black **

More often than not in projects that are not so automated and could use some of dem good tooling, you can find people in the pull requests arguing which formatting is better. How to change the formatting? Which one is better? Which one is more pep8 compliant?

It can be a nightmare that is as counter productive as it gets.

To get us rid of such problems and have it handled for us we use black in Python. Black is a code formatter that, well, just formats the code for you. You can make black automatically format your code before you commit. This way you can prevent any kind of arguments about pep8 and code formatting preferences of reviewers/authors, making the whole project have consistent formatting pattern, making it easier to read and so on. The easier code is to read, the better. It’s the lazy man approach. If you know what to expect, you won’t be surprised. The less you have to take care of, the better.

```python
def is_unique(
               s
               ):
    s = list(s
                )
    s.sort()
 
 
    for i in range(len(s) - 1):
        if s[i] == s[i + 1]:
            return 0
    else:
        return 1
 
 
if __name__ == "__main__":
    print(
          is_unique(input())
         )
```

Gets turned into this:
```python
def is_unique(s):
    s = list(s)
    s.sort()
 
    for i in range(len(s) - 1):
        if s[i] == s[i + 1]:
            return 0
    else:
        return 1
 
 
if __name__ == "__main__":
    print(is_unique(input()))
```

Example from geeksforgeeks.org.

### ' vs "

One thing worth noting is the fact that Python as a Language allows for the usage of both ' and " to mark strings. Black by default prefers double quotes over single. Why? Readability, usage of single quote in English language and the need to escape it everytime we use it inside our strings, it’s harder to mistake with   sign.

So on so forth. One may argue here, I stand united with the double quote crowd as IMO it’s the better approach. Readability is king.



## Isort

Have ya heard about imports sorting? It makes sense

### **Why you should sort your imports properly**

The bigger the project we work on, usually the more stuff we import from other pieces of the code.

As time goes by, these imports can become messy. It’s often the case. Isort is something that helps us with that by optimising our imports, sorting them properly, alphabetically, grouping them in sections and so on. I know this can look like a minor thing, but it’s these minor things that overall add to general code quality. Now look at the images below, the left one is before isort, right one is after it. Which one is more readable to you?

```python
from my_lib import Object

import os

from my_lib import Object3

from my_lib import Object2

import sys

from third_party import lib15, lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8, lib9, lib10, lib11, lib12, lib13, lib14

import sys

from __future__ import absolute_import

from third_party import lib3

print("Hey")
print("yo")

```

Gets turned into:

```python
from __future__ import absolute_import

import os
import sys

from third_party import (lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8,
                         lib9, lib10, lib11, lib12, lib13, lib14, lib15)

from my_lib import Object, Object2, Object3

print("Hey")
print("yo")
```



## Absolufy-imports

The new standard is to have absolute imports. Why that is you can read on your own. There were multiple debates regarding that, the result of which is: when you can prefer absolute imports. They make for less ambiguity and provide clearer distinction of what we are really using, from which package.

We also have a tool for that which is absolufy-imports. This tool is especially usefull when dealing with older projects where you might need to fix the imports in a lot of files to fit the new convention. This tool does that for you.

**This:**

```python
from .notifications.some_important_file import SomeClass
from .another_important_file import AnotherClass
```

**Gets turned into this:**

```python
from em.jobs.notifications.some_important_file import SomeClass
from em.jobs.notifications.another\_important_file import AnotherClass
```





## Bandit

Static analysis of our code for potential security threads.

### Why sometimes you need a bandit in your life

When we write our code we should have security in mind. Unless you sometimes want to make your company vulnerable to potentially losing millions. I’m going overboard with this example, but still. Security is important.

Somehow we can make mistakes simple because of forgetfulness and negligence that could have been prevented otherwise. To remind us of this there are various tool that you can use.

Among them is bandit. Bandit is a static analysis tool that scans your code for potentially unsafe fragments of code and warns you about them. When you run bandit against your code you’ll get a report like this and a list of where in code the potential problems are.

```python
Code scanned: 
Total lines of code: 52868 Total lines skipped (#nosec): 0 
Run metrics: 
  Total issues (by severity): 
    Undefined: 0 
    Low: 105 
    Medium: 38 
    High: 7 
    
Total issues (by confidence): 
  Undefined: 0 
  Low: 15 
  Medium: 18 
  High: 117
```

## autoflake

The less you have…

### Reducing waste

Sometimes it so happens that we may have unused import statements in our code or unused variables. Happens to the best. In order to automatically take care of those we may want to include autoflake in our projects.

It’s a tool that simply takes care of that – removing unused imports and variables.

No magic here.

## pyupgrade

This piece of software automatically upgrades some old syntax patterns to newer ones. That’s it.

```python
-set(())
+set()
-set([])
+set()
-set((1,))
+{1}
-set((1, 2))
+{1, 2}
-set([1, 2])
+{1, 2}
-set(x for x in y)
+{x for x in y}
-set([x for x in y])
+{x for x in y}
-dict((a, b) for a, b in y)
+{a: b for a, b in y}
-dict([(a, b) for a, b in y])
+{a: b for a, b in y}
-'{0} {1}'.format(1, 2)
+'{} {}'.format(1, 2)
-'{0}' '{1}'.format(1, 2)
+'{}' '{}'.format(1, 2)

```

Examples can be found above.

## bumpversion

There’s this thing we call semantic versioning or semver. It’s a convention that tells us to version our code according to the following pattern: MAJOR.MINOR.PATCH

For example: v0.2.12

Major piece is incremented when we go for major rollouts that change A LOT.

Minor piece is incremented when we do normal releases eg with bigger features.

Patch is something we use for smaller features, patches, fixes etc. This one grows the fastest.

In order for us to not have to manage it manually, we have a tool called bumpversion. It updates the version, creates a commit with the changes, creates a git tag and so on, all automatically. It’s a neat little piece of tooling to have in you CI/CD.

This makes it easier to manage versions, create changelogs, filter commits and spot changes, bugs, versioning of your packages/api etc.

You can see example commit message history and bumpversion usage here, in my project's commit history - [braindead](https://github.com/grski/braindead/commits/develop)

Do we run all of these by hand?

No. We want to be lazy.
## Git hooks & pre-commit

Automate boring tasks.

### Git hooks and pre-commit

If you want to make all of this happen automatically, you can create git hooks that are fired eg. When you commit or before the commit. One way is to just **create .pre-commit file and put it in your .git** folder and leverage eg. **Makefile** or use something like **pre-commit** tool.

It’s a nice handy tool that handles this for you. You need to install it and create config for it to tell it which things to do before the commit. No magic here.

I’ll let you google the details yourself☺

## Example Makefile

Below you can find an example of a bit outdated Makefile that I use.

```makefile
PATH  := $(PATH)
SHELL := /bin/bash

flake:
	flake8 -v ./

isort:
	isort --check-only --diff ./

isort-inplace:
	isort ./

bandit:
	bandit -x './styles/*' -r ./

black:
	black --check --line-length 120 --exclude "/(\.eggs|\.git|\.hg|\.mypy _cache|\.nox|\.tox|\.venv|_build|buck- out|build|dist|migrations|node_modules)/" ./

linters:
	make flake
	make isort
	make bandit
	make black

bumpversion:
	bumpversion --message '[skip ci] Bump version: {current_version} → {new_version}' --list --verbose $(part)

black-inplace:
	black --line-length 120 --exclude "/(\.eggs|\.git|\.hg|\.mypy _cache|\.nox|\.tox|\.venv|_build|buck- out|build|dist|migrations|node_modules)/" ./

autoflake-inplace:
	autoflake --remove-all-unused-imports --in-place --remove-unused-variables -r --exclude "styles" ./

format-inplace:
	make black-inplace
	make autoflake-inplace
	make isort-inplace
```



## Summary

Black, isort, absolufy-imports, pyupgrade, autoflake, bandit, bumpversion are tools that will make your life a bit easier.

Maybe it's a good idea to include them in your local development flow and pipelines?
