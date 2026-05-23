import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import type { Car } from "@/types/car";

// Try to embed the logo at module load. If the file isn't reachable (dev,
// rare deploy edge cases) we just skip it — the PDF still renders.
let logoSrc: { data: Buffer; format: "png" } | null = null;
try {
  logoSrc = {
    data: fs.readFileSync(
      path.join(process.cwd(), "public", "images", "logo-transparent.png"),
    ),
    format: "png",
  };
} catch {
  logoSrc = null;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 60,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1E2A3A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#1E2A3A",
  },
  logo: {
    width: 110,
    height: 32,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1E2A3A",
  },
  subtitle: {
    fontSize: 9,
    color: "#5b6570",
    marginTop: 2,
  },
  legalNote: {
    fontSize: 8,
    color: "#5b6570",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 14,
    lineHeight: 1.4,
  },
  section: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#cbd0d6",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1E2A3A",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  cellLabel: {
    width: "48%",
    paddingRight: 6,
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
  },
  cellValue: {
    width: "52%",
  },
  cellValueMuted: {
    fontFamily: "Helvetica-Oblique",
    color: "#9aa1a8",
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#5b6570",
    textAlign: "center",
  },
  // Back page styles
  backTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1E2A3A",
    marginBottom: 14,
  },
  backLead: {
    fontSize: 9,
    color: "#1E2A3A",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  backHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1E2A3A",
    marginTop: 10,
    marginBottom: 4,
  },
  backText: {
    fontSize: 9,
    color: "#1E2A3A",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
  },
});

function Field({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text
        style={
          muted ? [styles.cellValue, styles.cellValueMuted] : styles.cellValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

const fmtBool = (v: boolean) => (v ? "Yes" : "No");
const fmtCurrency = (v: number) =>
  `$${v.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtDate(s: string | null | undefined): string {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

// Returns a normalised value + whether to render in the muted italic style.
function or(s: string | null | undefined): {
  value: string;
  muted: boolean;
} {
  if (s && String(s).trim()) return { value: String(s), muted: false };
  return { value: "Not specified", muted: true };
}

function dateOr(s: string | null | undefined): {
  value: string;
  muted: boolean;
} {
  const formatted = fmtDate(s);
  if (formatted) return { value: formatted, muted: false };
  return { value: "Not specified", muted: true };
}

export default function CinPdf({ car }: { car: Car }) {
  const cin = car.cin;
  if (!cin) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Consumer Information Notice</Text>
          <Text>No CIN data available for this vehicle.</Text>
        </Page>
      </Document>
    );
  }

  const traderReg = or(cin.trader.traderRegistrationNumber);
  const vinV = or(cin.vin);
  const regoPlate = or(cin.regoPlate);
  const nzFirstReg = dateOr(cin.nzFirstRegistered);
  const overseasFirstReg = or(cin.overseasFirstRegistered);
  const countryLastReg = or(cin.countryLastRegistered);
  const wofExpiry = dateOr(cin.wofOrCofExpiry);
  const licenceExpiry = dateOr(cin.vehicleLicenceExpiry);

  return (
    <Document>
      {/* ---- Page 1: the Consumer Information Notice ---- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
              IDEAL CARS
            </Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.title}>Consumer Information Notice</Text>
            <Text style={styles.subtitle}>
              {car.year} {car.make} {car.model} · Stock #{car.stockNumber}
            </Text>
          </View>
        </View>

        <Text style={styles.legalNote}>
          This Consumer Information Notice is provided under the Motor Vehicle
          Sales Act 2003 and the Fair Trading Act 1986. The information below
          is supplied by the trader to assist you in deciding whether to
          purchase this vehicle. See page 2 for important buyer information.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trader Information</Text>
          <Field label="Name" value={cin.trader.name} />
          <Field label="Address" value={cin.trader.address} />
          <Field
            label="Registered trader"
            value={fmtBool(cin.trader.isRegisteredTrader)}
          />
          <Field
            label="Registration #"
            value={traderReg.value}
            muted={traderReg.muted}
          />
          {cin.trader.phone && (
            <Field label="Phone" value={cin.trader.phone} />
          )}
          {cin.trader.contactPerson && (
            <Field label="Contact" value={cin.trader.contactPerson} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Information</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Cash price" value={fmtCurrency(cin.cashPrice)} />
            </View>
            <View style={styles.col}>
              <Field
                label="Security interest"
                value={cin.securityInterest || "None"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Identification</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="VIN" value={vinV.value} muted={vinV.muted} />
              <Field
                label="Engine capacity"
                value={cin.engineCapacityCc > 0 ? `${cin.engineCapacityCc} cc` : "Not specified"}
                muted={cin.engineCapacityCc === 0}
              />
              <Field
                label="Odometer"
                value={`${cin.odometer.toLocaleString("en-NZ")} ${cin.odometerUnit}`}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Radio 88-108 MHz"
                value={fmtBool(cin.hasRadio88to108)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WoF / Licence / Registration</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Has WoF / CoF" value={fmtBool(cin.hasWofOrCof)} />
              <Field
                label="WoF / CoF expiry"
                value={wofExpiry.value}
                muted={wofExpiry.muted}
              />
              <Field
                label="Has vehicle licence"
                value={fmtBool(cin.hasVehicleLicence)}
              />
              <Field
                label="Licence expiry"
                value={licenceExpiry.value}
                muted={licenceExpiry.muted}
              />
            </View>
            <View style={styles.col}>
              <Field label="Registered" value={fmtBool(cin.isRegistered)} />
              <Field
                label="Rego plate"
                value={regoPlate.value}
                muted={regoPlate.muted}
              />
              <Field
                label="NZ first registered"
                value={nzFirstReg.value}
                muted={nzFirstReg.muted}
              />
              <Field label="Re-registered" value={fmtBool(cin.isReregistered)} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel & RUC</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Operating fuel" value={cin.operatingFuelType} />
            </View>
            <View style={styles.col}>
              <Field label="RUC applies" value={fmtBool(cin.rucApplies)} />
              <Field
                label="Outstanding RUC"
                value={fmtBool(cin.outstandingRuc)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Information</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Overseas first registered"
                value={overseasFirstReg.value}
                muted={overseasFirstReg.muted}
              />
              <Field
                label="Country last registered"
                value={countryLastReg.value}
                muted={countryLastReg.muted}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Imported as damaged"
                value={fmtBool(cin.importedAsDamaged)}
              />
            </View>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Page 1 of 2 · Generated by Ideal Cars · idealcarsnzltd@gmail.com ·
          020 4190 7335
        </Text>
      </Page>

      {/* ---- Page 2: Important information for buyers ---- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
              IDEAL CARS
            </Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.title}>Important Information</Text>
            <Text style={styles.subtitle}>For buyers of used motor vehicles</Text>
          </View>
        </View>

        <Text style={styles.backLead}>
          This Consumer Information Notice (CIN) tells you key information
          about the vehicle you may be considering buying. The trader is
          required by law to display this notice prominently at the place of
          sale and to give you a copy on request.
        </Text>

        <Text style={styles.backHeading}>Your rights as a buyer</Text>
        <Text style={styles.backText}>
          The Consumer Guarantees Act 1993 and Fair Trading Act 1986 protect
          you when buying a vehicle from a registered motor vehicle trader.
          Among other things:
        </Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            The vehicle must be of acceptable quality and free from minor
            defects, taking account of its age, price, and how it was
            described.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            It must be reasonably fit for any purpose you told the trader you
            wanted it for.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Information in this CIN must be accurate and not misleading. If
            it isn&apos;t, you may have a right to a remedy.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            The trader must have the right to sell the vehicle (no
            undisclosed money owing on it).
          </Text>
        </View>

        <Text style={styles.backHeading}>Warranty</Text>
        <Text style={styles.backText}>
          Ask the trader for details of any manufacturer&apos;s warranty,
          mechanical warranty, or insurance-backed warranty before purchasing.
          Get any warranty terms in writing.
        </Text>

        <Text style={styles.backHeading}>Warrant of Fitness (WoF)</Text>
        <Text style={styles.backText}>
          A used vehicle being sold by a trader must have a WoF issued no more
          than one month before delivery, unless you agree in writing that
          the trader is not required to provide one.
        </Text>

        <Text style={styles.backHeading}>Vehicle Licence (Rego)</Text>
        <Text style={styles.backText}>
          You become responsible for the vehicle&apos;s licensing from the
          date of purchase. Check the current expiry shown on this notice and
          renew before it lapses.
        </Text>

        <Text style={styles.backHeading}>Road User Charges (RUC)</Text>
        <Text style={styles.backText}>
          Diesel vehicles (and some petrol electric vehicles) require Road
          User Charges purchased from NZTA. You are responsible for RUC from
          the date of purchase. Check whether any outstanding RUC apply to
          this vehicle.
        </Text>

        <Text style={styles.backHeading}>If you have a problem</Text>
        <Text style={styles.backText}>
          First, try to resolve the issue with the trader directly. If you
          can&apos;t reach an agreement, you can contact:
        </Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Motor Vehicle Disputes Tribunal — 0800 367 6838
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Commerce Commission — 0800 943 600 · comcom.govt.nz
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Disputes Tribunal at your local court
          </Text>
        </View>

        <Text style={styles.backHeading}>Motor Vehicle Traders Register</Text>
        <Text style={styles.backText}>
          Registered motor vehicle traders must comply with the Motor Vehicle
          Sales Act 2003. You can verify a trader&apos;s registration at
          register.motortraders.govt.nz.
        </Text>

        <Text style={styles.footer} fixed>
          Page 2 of 2 · Generated by Ideal Cars · idealcarsnzltd@gmail.com ·
          020 4190 7335
        </Text>
      </Page>
    </Document>
  );
}
