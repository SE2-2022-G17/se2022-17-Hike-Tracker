TEMPLATE FOR RETROSPECTIVE (Team 17)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 5 vs 5 
- Total points committed vs. done: 21 vs 21
- Nr of hours planned vs. spent (as a team): 62h vs 65h 5m

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    6    |   5    |  8h 15m    |     7h 45m   |
| #5     |    6    |   5    |    9h      |     10h      |
| #6     |     5   |   5    |  10h 30m   |    10h 5m    |
| #7     |    8    |   5    |     9h     |    8h 30m    |
| #8     |    7    |   3    |    14h     |     16h      |
| #9     |    7    |   3    |  11h 20m   |   13h 30m    |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average: 1h 38m vs 1h 43m, standard deviation (estimate and actual):  55m vs 1h 4m
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1: (62h / 65.8h ) - 1 = - 0.05 %

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 6h 
  - Total hours spent:  7h 15m
  - Nr of automated unit test cases: 15
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: 5h 30m
  - Total hours spent: 8h 
- Code review 
  - Total hours estimated: 5h
  - Total hours spent: 5h
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
-- Test time was underestimated because we had to prepare a specific database for each test

- What lessons did you learn (both positive and negative) in this sprint?
-- Estimation was done better in this sprint
-- We have to improve test coverage

- Which improvement goals set in the previous retrospective were you able to achieve? 
--  In this sprint we improved time estimation
  
- Which ones you were not able to achieve? Why?
-- Test coverage was not good enough

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
-- We want to improve UI usability
-- Reduce technical debt accumulated in sprint 1 and 2


- One thing you are proud of as a Team!!
-- Every team member gave his best 
