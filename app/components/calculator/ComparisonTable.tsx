import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExchangeRate } from "@/app/lib/services/marketComparison";
import AnimatedNumber from "./AnimatedNumber";

interface ComparisonTableProps {
  competitorRates: ExchangeRate[];
  ourRate: number;
  type: 'buy' | 'sell';
}

export default function ComparisonTable({ competitorRates, ourRate, type }: ComparisonTableProps) {
  const sortedRates = [...competitorRates].sort((a, b) => {
    const rateA = type === 'buy' ? a.buyRate : a.sellRate;
    const rateB = type === 'buy' ? b.buyRate : b.sellRate;
    return type === 'buy' ? rateA - rateB : rateB - rateA;
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Market Comparison</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exchange</TableHead>
            <TableHead className="text-right">Rate (NGN)</TableHead>
            <TableHead className="text-right">Spread</TableHead>
            <TableHead className="text-right">Trading Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
         <TableRow className="bg-green-50 dark:bg-green-900/20">
            <TableCell className="font-medium">trustBank</TableCell>
            <TableCell className="text-right">
              <AnimatedNumber value={ourRate} prefix="₦" />
            </TableCell>
            <TableCell className="text-right">0.5%</TableCell>
            <TableCell className="text-right">0.1%</TableCell>
          </TableRow>
          {sortedRates.map((rate) => (
            <TableRow key={rate.exchange}>
              <TableCell>{rate.exchange}</TableCell>
              <TableCell className="text-right">
                <AnimatedNumber 
                  value={type === 'buy' ? rate.buyRate : rate.sellRate} 
                  prefix="₦" 
                />
              </TableCell>
              <TableCell className="text-right">{rate.spread}%</TableCell>
              <TableCell className="text-right">{rate.fees.trading}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}