import { Identicon, Text } from '@gnosis.pm/safe-react-components'
import { TransactionSummary, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { List } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { CircleDot } from 'src/components/AppLayout/Header/components/CircleDot'
import { getChainById } from 'src/config'
import { ChainId } from 'src/config/chain.d'
import { isTransferTxInfo } from 'src/logic/safe/store/models/types/gateway.d'
import { generateSafeRoute, SAFE_ROUTES } from 'src/routes/routes'
import { grey400, sm, lg } from 'src/theme/variables'
import { CustomIconText } from 'src/components/CustomIconText'
import { getAssetInfo } from 'src/routes/safe/components/Transactions/TxList/utils'
import { TxInfo } from 'src/routes/safe/components/Transactions/TxList/TxCollapsed'

import OutgoingTxIcon from 'src/routes/safe/components/Transactions/TxList/assets/outgoing.svg'
import SettingsTxIcon from 'src/routes/safe/components/Transactions/TxList/assets/settings.svg'

import styled from 'styled-components'
import Spacer from 'src/components/Spacer'

// Replaces the to be implemented BE endpoint
import mockData from './mockData.json'
type MockType = {
  safeAddress: string
  chainId: ChainId
  totalPending: number
  summaries: TransactionSummary[]
}
const mock = mockData as unknown as MockType[]

/**
const getTxsAwaitingConfirmationByChainId = async (
  chainId: string,
  safeAddress: string,
): Promise<TransactionSummary[]> => {
  const { results } = await getTransactionQueue(GATEWAY_URL, chainId, checksumAddress(safeAddress))
  return results.reduce((acc, cur) => {
    if (
      isTransactionSummary(cur) &&
      isMultisigExecutionInfo(cur.transaction.executionInfo) &&
      cur.transaction.txStatus === LocalTransactionStatus.AWAITING_CONFIRMATIONS
    ) {
      return [...acc, cur.transaction]
    }
    return acc
  }, [])
}

type TransactionsSummaryPerChain = {
  [chainId: ChainId]: {
    [safeAddress: string]: TransactionSummary[]
  }
}
 */

const PendingTxsList = (): ReactElement => {
  // Code to be used when using the new BE endpoint
  /**
  const localSafesWithDetails = useLocalSafes()
  const localSafes: Record<string, string[]> = Object.entries(localSafesWithDetails).reduce(
    (result, [chain, safes]) => {
      const safesAddr = safes.map((safe) => safe.address)
      return { ...result, [chain]: safesAddr }
    },
    {},
  )

  const [txsAwaitingConfirmation, setTxsAwaitingConfirmation] = useState<TransactionsSummaryPerChain>({})
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

  const title = <h2>Transactions to Sign</h2>

  Fetch txs awaiting confirmations after retrieving the owned safes from the LocalStorage
  useEffect(() => {
    if (!isInitialLoad || !Object.keys(localSafes || {}).length) {
      return
    }

    const fetchAwaitingConfirmationTxs = async () => {
      const txs: TransactionsSummaryPerChain = {}

      // todo: remove the slice
      for (const [chainId, safesPerChain] of Object.entries(localSafes).slice(1, 3)) {
        txs[chainId] = {}
        const arrayPromises = safesPerChain.map((safeAddr) => {
          return getTxsAwaitingConfirmationByChainId(chainId, safeAddr)
        })
        const pendingTxs = await Promise.all(arrayPromises)

        pendingTxs.forEach((summaries, i) => {
          if (!summaries.length) return // filter out the safes without pending transactions
          const safeAddress = safesPerChain[i]
          txs[chainId][safeAddress] = summaries
        })
      }
      setTxsAwaitingConfirmation(txs)
      setIsInitialLoad(false)
    }
    fetchAwaitingConfirmationTxs()
  }, [localSafes, isInitialLoad])

  if (isInitialLoad) {
    return (
      <>
        {title}
        <h3>Loading</h3>
      </>
    )
  }

  if (Object.keys(txsAwaitingConfirmation).length === 0) {
    return (
      <>
        {title}
        <h3>No Transactions</h3>
      </>
    )
  }
   */

  const transactionsToDisplay = (): MockType[] => {
    const MAX_PENDING_TXS = 5

    // If there are more than 5 Safes with pending transactions
    if (mock.length >= MAX_PENDING_TXS) {
      return mock.slice(0, MAX_PENDING_TXS).map((safe) => ({ ...safe, summaries: [safe.summaries[0]] }))
    }

    // If there are less than MAX_PENDING_TXS in total
    const totalPendingTransactions = mock.reduce((acc, val) => acc + val.totalPending, 0)
    if (totalPendingTransactions <= MAX_PENDING_TXS) {
      return mock
    }

    const safesToDisplay: MockType[] = []
    let countDisplayTransactions = 0
    let summariesIndex = 0

    // Fill MAX_PENDING_TXS transactions to display
    while (countDisplayTransactions < MAX_PENDING_TXS) {
      for (let i = 0; i < mock.length; i++) {
        if (summariesIndex === 0) {
          // Deep copy
          const safe = JSON.parse(JSON.stringify(mock[i]))
          safe.summaries = [safe.summaries[summariesIndex]]
          safesToDisplay.push(safe)
        } else {
          const nextTxSummary = mock[i].summaries[summariesIndex]
          nextTxSummary && safesToDisplay[i].summaries.push(nextTxSummary)
        }
        countDisplayTransactions++
      }
      summariesIndex++
    }
    return safesToDisplay
  }

  return (
    <>
      <h2>Transactions to Sign</h2>
      <List component="div">
        {transactionsToDisplay().map(({ safeAddress, chainId, totalPending, summaries }) => {
          const { shortName } = getChainById(chainId)
          const url = generateSafeRoute(SAFE_ROUTES.TRANSACTIONS_QUEUE, { safeAddress, shortName })
          return summaries.map((transaction) => {
            const info = getAssetInfo(transaction.txInfo)
            return (
              <TransactionToConfirm key={transaction.id} to={url}>
                <OverlapDots>
                  <CircleDot networkId={chainId} />
                  <div style={{ width: `${lg}`, height: `${lg}` }}>
                    <Identicon address={safeAddress} size="sm" />
                  </div>
                </OverlapDots>
                <CustomIconText
                  address="0x"
                  iconUrl={
                    isTransferTxInfo(transaction.txInfo) && transaction.txInfo.direction === TransferDirection.OUTGOING
                      ? OutgoingTxIcon
                      : SettingsTxIcon || undefined
                  }
                />
                {info ? <TxInfo info={info} /> : <Spacer />}
                <Text color="text" size="lg" as="span" strong>
                  ({totalPending})
                </Text>
                <ChevronRightIcon />
              </TransactionToConfirm>
            )
          })
        })}
      </List>
    </>
  )
}

export default PendingTxsList

const OverlapDots = styled.div`
  height: 24px;
  width: 20px;
  position: relative;

  & > div {
    position: absolute;
    top: 4px;
  }
`

const TransactionToConfirm = styled(Link)`
  min-width: 270px;
  height: 40px;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 1fr 4fr 0.5fr 0.5fr;
  gap: 4px;
  margin: ${sm} auto;
  text-decoration: none;
  background-color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${grey400};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  padding: 4px;
`
