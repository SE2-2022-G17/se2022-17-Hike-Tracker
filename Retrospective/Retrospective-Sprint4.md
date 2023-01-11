TEMPLATE FOR RETROSPECTIVE (Team 17)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 13 vs. 13
- Total points committed vs done: 117 vs. 117
- Nr of hours planned vs spent (as a team): 72h vs. 74h 5m

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |      5  |    -   |  8h 20m    |  8h 35m      |
| #17    |     5   |    21    |       2h      |      2h 30m        |
|#18|5|13|2h|2h|
|#34|5|3|1h 45m|2h|
|#13|4|5|45m|45m|
|#14|6|8|9h 50m|9h 10m|
|#15|5|5|10h|10h 30m|
|#12|5|5|10h 30m|12h 15m|
|#19|5|13|2h 35m|4h 20m|
|#27|4|13|2h 40m|2h 20m|
|#29|4|5|1h 10m|1h 5m|
|#30|7|13|8h 25m|8h 35m|
|#32|4|5|4h 30m|3h 30m|
|#35|5|8|6h 30m|5h 30m|
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)
 - estimated hours average: 1,043
 - spent hours average: 1,074
 - estimated hours standard deviation: 1,062
 - spent hours standard deviation: 1,129

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1
 - 2,81%
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 10h 20m
  - Total hours spent: 9h 45m
  - Nr of automated unit test cases: 182
  - Coverage: 92.2%
- E2E testing:
  - Total hours estimated: 5h 20m
  - Total hours spent: 5h 25m
- Code review 
  - Total hours estimated: 6h 25m
  - Total hours spent: 5h 15m
- Technical Debt management:
  - Total hours estimated: 1h 20m
  - Total hours spent: 1h 20m
  - Hours estimated for remediation by SonarQube: 10h
  - Hours estimated for remediation by SonarQube only for the selected and planned issues: 2h 35m
  - Hours spent on remediation: 1h 20m
  - debt ratio (as reported by SonarQube under "Measures-Maintainability"): 0.2%
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability ):
   - reliability: A
   - security: A
   - maintainability: A
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
 - Our estimation was almost perfect. The developing tasks were a little bit understimated.

- What lessons did you learn (both positive and negative) in this sprint?
 - We have learnt to do right estimation of tasks.
 - We have learnt to write code with less code smells then before.

- Which improvement goals set in the previous retrospective were you able to achieve? 
 - We have about doubled the time spent in testing, and on SonarCloud the coverage went to 92.2%
  
- Which ones you were not able to achieve? Why?
 - We didn't improve code modularity, because we decided to deliver more US and let this technical debt.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
 - Increase time spent on technical debt management

- One thing you are proud of as a Team!!
 - Everyone has done his/her part and we helped each other.
