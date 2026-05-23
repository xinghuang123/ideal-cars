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
import type { Car, BcgChecklistItem } from "@/types/car";

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
    marginBottom: 12,
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
  },
  row: { flexDirection: "row", marginBottom: 3 },
  cellLabel: {
    width: "48%",
    paddingRight: 6,
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
  },
  cellValue: { width: "52%" },
  cellValueMuted: {
    fontFamily: "Helvetica-Oblique",
    color: "#9aa1a8",
  },
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  categoryHeader: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5b6570",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  itemName: { flex: 2 },
  itemStatus: { flex: 1, fontFamily: "Helvetica-Bold" },
  itemComment: { flex: 2, color: "#5b6570" },
  statusOK: { color: "#15803d" },
  statusAttention: { color: "#b45309" },
  statusNA: { color: "#5b6570" },
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

function statusStyle(status: BcgChecklistItem["status"]) {
  if (status === "OK") return styles.statusOK;
  if (status === "Requires Attention") return styles.statusAttention;
  return styles.statusNA;
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

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

function Header({
  rightTitle,
  rightSubtitle,
}: {
  rightTitle: string;
  rightSubtitle: string;
}) {
  return (
    <View style={styles.header} fixed>
      {logoSrc ? (
        <Image src={logoSrc} style={styles.logo} />
      ) : (
        <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
          IDEAL CARS
        </Text>
      )}
      <View style={styles.headerRight}>
        <Text style={styles.title}>{rightTitle}</Text>
        <Text style={styles.subtitle}>{rightSubtitle}</Text>
      </View>
    </View>
  );
}

export default function BcgPdf({ car }: { car: Car }) {
  const bcg = car.bcg;
  if (!bcg) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Basic Condition Guide</Text>
          <Text>No BCG data available for this vehicle.</Text>
        </Page>
      </Document>
    );
  }

  const grouped = bcg.checklist.reduce<Record<string, BcgChecklistItem[]>>(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push(item);
      return acc;
    },
    {},
  );

  const inspectionDate = dateOr(bcg.inspectionDate);
  const subtitle = `${car.year} ${car.make} ${car.model} · Stock #${car.stockNumber}`;

  return (
    <Document>
      {/* ---- Page 1: the Basic Condition Guide ---- */}
      <Page size="A4" style={styles.page}>
        <Header rightTitle="Basic Condition Guide" rightSubtitle={subtitle} />

        <Text style={styles.legalNote}>
          This Basic Condition Guide records the trader&apos;s assessment of
          the vehicle&apos;s condition at the inspection date below. It is
          provided alongside the Consumer Information Notice to help you make
          an informed purchase decision. See page 2 for guidance on reading
          this report.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Date"
                value={inspectionDate.value}
                muted={inspectionDate.muted}
              />
              <Field label="Inspector" value={or(bcg.inspectorName).value} />
            </View>
            <View style={styles.col}>
              <Field label="Publisher" value={or(bcg.publisherName).value} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {Object.entries(grouped).map(([category, items]) => (
            <View key={category} wrap={false}>
              <Text style={styles.categoryHeader}>{category}</Text>
              {items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <Text style={[styles.itemStatus, statusStyle(item.status)]}>
                    {item.status}
                  </Text>
                  <Text style={styles.itemComment}>{item.comment ?? ""}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tyre Depths (mm)</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Front left"
                value={String(bcg.tyreDepths.frontLeft)}
              />
              <Field
                label="Front right"
                value={String(bcg.tyreDepths.frontRight)}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Rear left"
                value={String(bcg.tyreDepths.rearLeft)}
              />
              <Field
                label="Rear right"
                value={String(bcg.tyreDepths.rearRight)}
              />
              {bcg.tyreDepths.spare !== undefined && (
                <Field label="Spare" value={String(bcg.tyreDepths.spare)} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Condition</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Seats" value={or(bcg.interiorCondition.seats).value} />
              <Field
                label="Carpets"
                value={or(bcg.interiorCondition.carpets).value}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Panels"
                value={or(bcg.interiorCondition.panels).value}
              />
              <Field
                label="Dashboard"
                value={or(bcg.interiorCondition.dashboard).value}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field
                label="Timing mechanism"
                value={bcg.engineTimingMechanism}
              />
            </View>
            <View style={styles.col}>
              <Field
                label="Cam belt replaced"
                value={
                  bcg.camBeltReplaced === null
                    ? "N/A"
                    : bcg.camBeltReplaced
                      ? "Yes"
                      : "No"
                }
                muted={bcg.camBeltReplaced === null}
              />
              {bcg.camBeltReplacedKms !== null && (
                <Field
                  label="Cam belt replaced at"
                  value={`${bcg.camBeltReplacedKms.toLocaleString("en-NZ")} km`}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions & Comments</Text>
          <Field label="Road conditions" value={bcg.roadConditions} />
          <Field label="Body conditions" value={bcg.bodyConditions} />
          {bcg.bodyComments && (
            <Field label="Body comments" value={bcg.bodyComments} />
          )}
          {bcg.underCarriageComments && (
            <Field
              label="Under-carriage"
              value={bcg.underCarriageComments}
            />
          )}
          {bcg.generalComments && (
            <Field label="General" value={bcg.generalComments} />
          )}
        </View>

        <Text style={styles.footer} fixed>
          Page 1 of 2 · Generated by Ideal Cars · idealcarsnzltd@gmail.com ·
          020 4190 7335
        </Text>
      </Page>

      {/* ---- Page 2: How to read this report ---- */}
      <Page size="A4" style={styles.page}>
        <Header
          rightTitle="How to Read this Report"
          rightSubtitle="Basic Condition Guide — guidance for buyers"
        />

        <Text style={styles.backLead}>
          A Basic Condition Guide (BCG) is a snapshot of the vehicle&apos;s
          condition at the inspection date. It is based on a visual and
          functional check by the trader or an authorised inspector, without
          dismantling the vehicle. The BCG is intended to give you a clear
          starting point for any further checks you may wish to make before
          purchase.
        </Text>

        <Text style={styles.backHeading}>What the status ratings mean</Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: "#15803d" }}>
              OK
            </Text>
            {" — "}
            the item was found to be in serviceable condition at the time of
            inspection.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: "#b45309" }}>
              Requires Attention
            </Text>
            {" — "}
            the item has a noted defect, wear, or other concern that the
            buyer should consider. Check the comment column for detail.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: "#5b6570" }}>
              N/A
            </Text>
            {" — "}
            the item does not apply to this vehicle, or could not be assessed
            without further inspection.
          </Text>
        </View>

        <Text style={styles.backHeading}>Tyre depths</Text>
        <Text style={styles.backText}>
          Tyre tread depths are reported in millimetres. The legal minimum
          tread depth in New Zealand is 1.5 mm across the central three
          quarters of the tyre. Below 3 mm wet-weather grip falls off
          significantly, so plan for replacement well before the legal limit.
        </Text>

        <Text style={styles.backHeading}>Cam belt / timing</Text>
        <Text style={styles.backText}>
          If the engine uses a cam belt (rather than a chain), it should be
          replaced at the manufacturer&apos;s recommended interval, typically
          every 100,000 km or 5 years. If &quot;Cam belt replaced&quot; is
          shown as &quot;No&quot; or unknown on an older vehicle, factor a
          replacement into your purchase budget.
        </Text>

        <Text style={styles.backHeading}>What this report does not cover</Text>
        <Text style={styles.backText}>
          The BCG is not a comprehensive pre-purchase inspection. It does not
          replace:
        </Text>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            A full mechanical inspection by an independent qualified
            mechanic.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            A current Warrant of Fitness (WoF) check, which is required for
            registration.
          </Text>
        </View>
        <View style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>
            Any structural assessment, such as a check for previous accident
            damage or chassis condition.
          </Text>
        </View>

        <Text style={styles.backHeading}>Recommended next steps</Text>
        <Text style={styles.backText}>
          We encourage every buyer to arrange an independent pre-purchase
          inspection (PPI) before finalising a vehicle purchase, especially
          for older or higher-mileage cars. Organisations such as AA Auto
          Centre and VTNZ offer this service. Use this BCG and the matching
          Consumer Information Notice as a basis for the questions you ask
          the inspector.
        </Text>

        <Text style={styles.backHeading}>Your rights as a buyer</Text>
        <Text style={styles.backText}>
          The Consumer Guarantees Act 1993 and Fair Trading Act 1986 protect
          you when buying from a registered motor vehicle trader. Information
          provided in this report must be accurate and not misleading. If you
          believe a problem exists that wasn&apos;t disclosed, raise it with
          the trader first; failing resolution, you may contact the Motor
          Vehicle Disputes Tribunal (0800 367 6838) or the Disputes Tribunal
          at your local court.
        </Text>

        <Text style={styles.footer} fixed>
          Page 2 of 2 · Generated by Ideal Cars · idealcarsnzltd@gmail.com ·
          020 4190 7335
        </Text>
      </Page>
    </Document>
  );
}
