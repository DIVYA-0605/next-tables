
import Chart from '@/components/Chart'
import TableDisplay from '@/components/TableList'
import Image from 'next/image'

export default function Home() {
  return (
    <main>
      <div>
        {/* <h1>hello</h1> */}
        <TableDisplay/>
        <div className='mt-10'>
        <Chart/>
        </div>
        
      </div>
    </main>
  )
}
