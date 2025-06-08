import { writeFileSync } from 'fs'

let text = ''
let line = ''
let header = ''

function getProbabilitiesNaive(p, N, Cap) {
    const P = (i) => (i === Cap ? 1 : p)
    // p ** (1-i===Cap)

    function F(k, n) {
        // Incoherent values
        if (k > n || k <= n / Cap - 1) {
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
        for (let i = 1; i <= n - k + 1 && i <= Cap; ++i) {
            s += F(k - 1, n - i) * (1 - p) ** (i - 1) * P(i)
        }
        return s
    }
    const probabilities = []
    for (let i = 0; i < N + 1; ++i) {
        probabilities[i] = F(i, N)
    }
    return probabilities
}

function getProbabilities(p, N, Cap, options = { returnCache: false }) {
    function F(k, n) {
        let s = 0
        for (let i = 1; i <= n - k + 1 && i <= Cap; ++i) {
            // use cache
            s += localFCache[n - i][k - 1] * (1 - p) ** (i - 1) * (i === Cap ? 1 : p)
        }
        return s
    }

    const localFCache = []
    for (let i = 0; i <= N; ++i) {
        localFCache[i] = new Array(N + 1).fill(0)
    }
    // filling
    for (let i = 0; i <= N; ++i) {
        for (let j = 0; j <= i; ++j) {
            if (j === i) {
                localFCache[i][j] = p ** i
            } else if (j <= i / Cap - 1) {
                // or continue
                localFCache[i][j] = 0
            } else if (j === 0) {
                localFCache[i][j] = (1 - p) ** i
            } else {
                localFCache[i][j] = F(j, i)
            }
        }
    }
    // console.log(localFCache)
    if (options.returnCache) {
        return localFCache
    }

    const probabilities = localFCache[N]
    return probabilities
}
function getFocusedProbabilities(p1, N, Cap1, p2, Cap2) {
    const probNumber = getProbabilities(p1, N, Cap1)
    const all = getProbabilities(p2, N, Cap2, { returnCache: true })
    // console.log(all)
    const summed = Array(N + 1).fill(0)
    for (let i = 0; i <= N; ++i) {
        // start at i to avoid summing zeroes
        for (let j = i; j <= N; ++j) {
            summed[i] += (all[j][i] ?? 0) * probNumber[j]
        }
    }
    return summed
}

function esperance(P) {
    return P.reduce((acc, p, i) => acc + i * p, 0)
}
function percent(n, k = 5) {
    return (100 * n).toFixed(k)
}
function p15(P) {
    // actually 16 total needed
    return 1 - P.reduce((acc, p, i) => (i <= 15 ? acc + p : acc), 0)
}

const n = 20000 // 30*25

const startTime = Date.now()
const prob = getProbabilities(0.0303, n, 30)
const endTime = Date.now()
console.log(
    prob,
    esperance(prob),
    esperance(prob) / n,
    prob.reduce((acc, val) => acc + val, 0),
    `Computed in ${endTime - startTime} ms`
)

/*
const startTime2 = Date.now()
const prob2 = getFocusedProbabilities(0.0303, n, 30, 0.3333, 3)
const endTime2 = Date.now()
console.log(
    // prob2,
    esperance(prob2),
    esperance(prob2) / n,
    prob2.reduce((acc, val) => acc + val, 0),
    p15(prob2),
    `Computed in ${endTime2 - startTime2} ms`
)
*/

const print = false

if (print) {
    // 1

    text += 'Chances of pulling X SSR over 30 pulls\n'
    const prob = getProbabilities(0.0303, 30, 30)

    for (let k = 0; k <= 30; ++k) {
        text += `${percent(prob[k])},`
    }
    text += '\n'

    console.log(text)
    writeFileSync('./out.csv', text)
}
