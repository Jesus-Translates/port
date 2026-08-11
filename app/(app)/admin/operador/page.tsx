import { requireOperator } from "@/lib/auth";
import { OperatorConsole } from "../operator-console";

export const metadata = { title: "Operador" };

export default async function OperatorPage() {
  await requireOperator();
  return <OperatorConsole />;
}
