TEMPLATE FOR RETROSPECTIVE (Team 17)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 4 vs 4 
- Total points committed vs. done: 44 vs 44
- Nr of hours planned vs. spent (as a team): 40h00m vs 71h05m

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#1_   |    6    |   13   |    8h      |   15.25h     |
| #2     |     5   |    5   |     5h     |    18.5h     |
| #3     |    8    |   5    |  10.3h     |      23h     |
| #4     |    7    |    21  |      12h   |   14.5h      |


   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average: 1h 29m vs 2h 37m, standard deviation (estimate and actual):  1h 36m vs 2h 10m
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1: (40h / 71h ) - 1 = 42%

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4h
  - Total hours spent:  7h 35m
  - Nr of automated unit test cases: 10
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: 3h
  - Total hours spent: 5h 10m
- Code review 
  - Total hours estimated: 3h
  - Total hours spent: 8h 30m
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
-- Implementation of geographic queries was understimated
-- User Interface development was understimated (validation, api...)
-- GPX file management
-- Learning of new tools, frameworks...

- What lessons did you learn (both positive and negative) in this sprint?
-- Realized that we understimated user stories
-- Have to deal with team members' code

- Which improvement goals set in the previous retrospective were you able to achieve? 
--  Task were assigned in a better way
  
- Which ones you were not able to achieve? Why?
-- We understimated task time

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
-- Consider learning times when dealing with new technologies, tools, frameworks
-- More realistic estimation


- One thing you are proud of as a Team!!
-- Great spirit of cooperation
