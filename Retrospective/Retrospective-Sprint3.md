TEMPLATE FOR RETROSPECTIVE 3 (Team 17)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 4 vs 4 
- Total points committed vs. done: 26 vs 26 
- Nr of hours planned vs. spent (as a team): 67h 40m vs 70h 55m

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |   22    |        |   34h 40m  |  36h 40m     |
| #33    |    6    |   8    |   11h      |    13h       |
| #10    |    5    |   8    |   6h       |    6h 15m    |
| #11    |    5    |   5    |   10h 30m  |    10h       |
| #31    |    5    |   5    |   5h 30m   |     5h       |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average: 1h 34m vs 1h 39m, standard deviation (estimate and actual):  55m vs 1h
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1: (67h 40m / 70h 55m) - 1 = 4.6 %

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 5h 
  - Total hours spent:  4h 45m
  - Nr of automated unit test cases: 18 during Sprint 3 (55 total)
  - Coverage: 79%
- E2E testing:
  - Total hours estimated: 3h 30m
  - Total hours spent: 4h 30m
- Code review 
  - Total hours estimated: 3h 30m
  - Total hours spent: 2h 30m
- Technical Debt management:
  - Total hours estimated: 19h
  - Total hours spent: 19h
  - Hours estimated for remediation by SonarQube: 104h
  - Hours estimated for remediation by SonarQube only for the selected and planned issues: 10h 3m
  - Hours spent on remediation
  - debt ratio (as reported by SonarQube under "Measures-Maintainability")
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability )



## ASSESSMENT

- What caused your errors in estimation (if any)?
  - Difficulty in finding a solution to mock databse connection using the adopted software stack
  - Difficulty in using third party software for maps management

- What lessons did you learn (both positive and negative) in this sprint?
  - ... 

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - We improved UI usability
  - We reduced Technical Debt from previous Sprints
  
- Which ones you were not able to achieve? Why?
  - The number of unit tests of some of the user stories is not sufficient, increasing the TD

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - Increase number and quality of unit tests
  - Modularize the code
  - Deal with assignments early, so that problems are detected in time for the deadline


- One thing you are proud of as a Team!!
  - We are alway available to help each other.
