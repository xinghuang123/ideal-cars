import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getVehicleById } from "@/lib/vehicles";
import CinPdf from "@/components/pdf/CinPdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const car = await getVehicleById(params.id);
  if (!car) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!car.cin) {
    return NextResponse.json(
      { error: "No CIN available for this vehicle" },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(<CinPdf car={car} />);
  const filename = `CIN-${car.stockNumber}-${car.make}-${car.model}.pdf`.replace(
    /\s+/g,
    "_",
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
