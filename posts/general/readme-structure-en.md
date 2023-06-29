Title: How to write a README like a pro 
Date:   2022-11-28
Authors: Olaf Górski
Slug: readme-structure-en
Language: en
Description: My take on writing a great README which is integral and essential part of every project.


There is a profound need for a proper README file in every project one works on. It's where very basic but key information regarding the projects should be contained, but not only that. A good README is made by having a bit more than basic project information. What exactly? We will go into that in this document.

## Technology

Usually the README we work with have `.md` extrension, the marking of a Markdown file. Markdown is something that let's us format text in a certain way. We will stick with that and assume Markdown is used in the README file for convenience's sake. Make note though, it does not have to be the case. 

## Sections

### Title 

Start your README with a line of a project name, like this: `# Example Project`. It's obvious but needed. `#` marks a given line as a header in Markdown.

### Summary

Here you must put basic information about the project. 
What system component it is? For example - API, Worker, frontend, library. 
What functionalities it includes? For example - This is invoicing API for foobar system.
Some additional context - Who the stakeholders are (for who is the project intended), what the business need/idea is behind this application, who are the actors, end users, few words about project from business perspective.
The summary should also contain and use wording that is closely tied to the Domain of the problem/need that the project is solving. 

### Tech stack

This section should contain the most important packages used to build the application, 3rd party dependencies, services etc. 

This will enable the reader to gain a quick understanding of application dependencies and the technology used, problems solved.

One should not forget to link the used technologies to proper websites, resources to ensure no ambiguity.

###  Local development setup

Write down a list of steps needed to bring the project up for development locally, on the developer's machine. Other than that you should also add a list of commonly executed operations like cleaning the databse; (re-)setup the project from scratch; migrate the database. Same with project-specific knowledge - this section is a good place for such things. For example - handling l10n, i18n with a 3rd party service like PhraseApp or OneSky.

Local development setup section should be prepared while having less technical people in mind, as stakeholders which not always are tech-savvy, might be using it. Additionally Local Development setup should be as automated as possible.

### Deployment

Briefly describe how the application is deployed, where to look for more detailed explanation if needed, what is the deploy setup or a few words about CI/CD. 

### Contributors

Leave some kind of list of people who contributed to the project or are key people in the context of this project. This can be useful when jumping from one project to another after some time, as it allows one to identify the context holders very quickly. 