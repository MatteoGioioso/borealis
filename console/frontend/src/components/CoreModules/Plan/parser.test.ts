import {PlanService} from "./parser";
import {parserFixtures} from "../../../../fixtures/parser.fixtures";

test('parser', () => {
    const l = new PlanService().fromSource(faultyPlan);
    console.log(JSON.stringify(JSON.parse(l), null, 2))
});

const faultyPlan = `                                                                                     QUERY PLAN                                                                                     
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Gather Merge  (cost=3746920.66..10099125.47 rows=51367424 width=44) (actual time=194070.494..220324.361 rows=19160881 loops=1)
         Workers Planned: 8
         Workers Launched: 8
         ->  Sort  (cost=3745920.52..3761972.84 rows=6420928 width=44) (actual time=51300.644..53486.394 rows=2128987 loops=9)
               Sort Key: d.name, (SUBSTRING(d.value FROM 1 FOR 255))
               Sort Method: quicksort  Memory: 181483kB
               Worker 0:  Sort Method: external merge  Disk: 379728kB
               Worker 1:  Sort Method: quicksort  Memory: 34800kB
               Worker 2:  Sort Method: quicksort  Memory: 42741kB
               Worker 3:  Sort Method: external merge  Disk: 846744kB
               Worker 4:  Sort Method: quicksort  Memory: 58495kB
               Worker 5:  Sort Method: quicksort  Memory: 33308kB
               Worker 6:  Sort Method: quicksort  Memory: 40501kB
               Worker 7:  Sort Method: quicksort  Memory: 306044kB
               ->  Partial HashAggregate  (cost=2672790.48..3019894.94 rows=6420928 width=44) (actual time=24668.113..25984.895 rows=2128987 loops=9)
                     Group Key: d.name, SUBSTRING(d.value FROM 1 FOR 255)
                     Planned Partitions: 4  Batches: 1  Memory Usage: 253969kB
                     Worker 0:  Batches: 5  Memory Usage: 524337kB  Disk Usage: 175520kB
                     Worker 1:  Batches: 1  Memory Usage: 131089kB
                     Worker 2:  Batches: 1  Memory Usage: 147473kB
                     Worker 3:  Batches: 5  Memory Usage: 524337kB  Disk Usage: 544128kB
                     Worker 4:  Batches: 1  Memory Usage: 139281kB
                     Worker 5:  Batches: 1  Memory Usage: 122897kB
                     Worker 6:  Batches: 1  Memory Usage: 131089kB
                     Worker 7:  Batches: 1  Memory Usage: 393233kB
 Planning Time: 21.015 ms
 Execution Time: 227841.764 ms
(236 rows)
`

parserFixtures.forEach(planTest => {
    describe('parser tests', () => {
        test('parser', () => {
            const out = new PlanService().fromSource(planTest.input);
            expect(JSON.parse(out)).toStrictEqual(planTest.expected)
        });
    });
})