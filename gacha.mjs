import { inspect } from 'util'

/**
 * Note : this naive implementation is EXTREMELY SLOW
 *
 * In fact, if you map it out, you can realize that
 *  computing F(p, pity, NPulls) requires callling
 *  roughly NPulls*pity times the F() function.
 * Each of these calls then call the F function, and
 *  the overall time complexity is exponential.
 * Of course, we can simply use a cache to force each
 *  call to happen at most 1 times, reducting the time
 *  complexity to O(Pity*Npull³) at the cost of requiring
 *  a Npulls² size matrix (in fact, half of that if you're
 *  willing to do funky indexing : the matrix is triangular)
 *  to store the results of the F() calls (conceptually,
 *  an Npulls-sized array of distibutions that are at
 *  most Npulls-sized).
 */

function getProbabilitiesNaive(p, pity, NPulls) {
    const P = (i) => (i === pity ? 1 : p)
    // p ** (1-i===Cap)

    function F(k, n) {
        // Incoherent values
        if (k > n || k <= n / pity - 1) {
            return 0
        }
        // Stop recursion
        if (k === n) {
            return p ** n
        }
        if (k === 0) {
            return (1 - p) ** n
        }

        // Main recursion
        let s = 0
        for (let i = 1; i <= n - k + 1 && i <= pity; ++i) {
            s += F(k - 1, n - i) * (1 - p) ** (i - 1) * P(i)
        }
        return s
    }
    const probabilities = []
    for (let i = 0; i < NPulls + 1; ++i) {
        probabilities[i] = F(i, NPulls)
    }
    return probabilities
}

function esperance(P) {
    return P.reduce((acc, p, i) => acc + i * p, 0)
}

function percent(n, k = 3) {
    return (100 * n).toFixed(k) + '%'
}

const n = 20 // DO NOT USE >25
const p = 0.0303
const pity = 30

const startTime = Date.now()
const prob = getProbabilitiesNaive(p, n, pity)
const endTime = Date.now()

const esp = esperance(prob)

console.log(`Computing distribution for ${n} pulls.
p=${p}, pity at ${pity}

Average number of hits : ${esp} (${percent(esp / n)} of the total)

Checksum : ${prob.reduce((acc, val) => acc + val, 0)} (difference with 1 is sum of numerical errors)
Computed in ${endTime - startTime} ms

Full distribution below.
array[i] = probability of getting i hits
    `)
console.log(inspect(prob))
