import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
  },
  logoSubtext: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
    fontWeight: 'bold',
  },
  logoTagline: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 1,
  },
  quoteInfo: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
  },
  text: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 2,
    lineHeight: 1.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: {
    width: '48%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'solid',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
  },
  total: {
    backgroundColor: '#dbeafe',
    fontWeight: 'bold',
  },
  inclusions: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  inclusionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  specialRequestsBox: {
    backgroundColor: '#f9fafb',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  depositHighlight: {
    backgroundColor: '#fef3c7',
    padding: 6,
    marginTop: 6,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    borderLeftStyle: 'solid',
  },
  compactTermsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compactColumn: {
    width: '32%',
  },
  smallText: {
    fontSize: 7,
    lineHeight: 1.2,
    marginBottom: 1,
  }
});

// PDF Document Component
export const QuotePDF = ({ quote }: { quote: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>KOS YACHT CHARTER</Text>
          <Text style={styles.logoTagline}>Luxury Boat Rentals & Charter Services</Text>
        </View>
        <View style={styles.quoteInfo}>
          <Text style={styles.quoteTitle}>Quote #{quote.id}</Text>
          <Text style={styles.text}>Created: {new Date(quote.dates.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.text}>Expires: {new Date(quote.dates.expiresAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Customer and Booking Info in Two Columns */}
      <View style={styles.twoColumnContainer}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>{quote.customer.name}</Text>
          <Text style={styles.text}>{quote.customer.email}</Text>
          {quote.customer.phone && <Text style={styles.text}>{quote.customer.phone}</Text>}
        </View>
        
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Boat:</Text> {quote.boat.name}</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Date:</Text> {new Date(quote.details.date).toLocaleDateString()}</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Time:</Text> {quote.details.startTime} - {quote.details.endTime}</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Passengers:</Text> {quote.details.numberOfPassengers}</Text>
          {quote.details.location && <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>Location:</Text> {quote.details.location}</Text>}
        </View>
      </View>

      {/* Inclusions and Special Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inclusions & Services</Text>
        <View style={styles.inclusionsContainer}>
          {quote.details.includesCaptain && <Text style={styles.inclusions}>✓ Professional Captain  </Text>}
          {quote.details.includesFuel && <Text style={styles.inclusions}>✓ Fuel  </Text>}
          {quote.details.includesInsurance && <Text style={styles.inclusions}>✓ Insurance Coverage  </Text>}
        </View>
        {quote.details.specialRequests && (
          <View style={styles.specialRequestsBox}>
            <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 2 }]}>Special Requests:</Text>
            <Text style={[styles.text, { fontSize: 8 }]}>{quote.details.specialRequests}</Text>
          </View>
        )}
      </View>

      {/* Pricing Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCellRight}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Base Charter Rate</Text>
            <Text style={styles.tableCellRight}>${quote.pricing.basePrice.toFixed(2)}</Text>
          </View>
          {quote.pricing.captainFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Captain Fee</Text>
              <Text style={styles.tableCellRight}>${quote.pricing.captainFee.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Cleaning Fee</Text>
            <Text style={styles.tableCellRight}>${quote.pricing.cleaningFee.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Service Fee</Text>
            <Text style={styles.tableCellRight}>${quote.pricing.serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Tax</Text>
            <Text style={styles.tableCellRight}>${quote.pricing.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.tableRow, styles.total]}>
            <Text style={[styles.tableCell, { fontWeight: 'bold', fontSize: 10 }]}>TOTAL AMOUNT</Text>
            <Text style={[styles.tableCellRight, { fontWeight: 'bold', fontSize: 10 }]}>${quote.pricing.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.depositHighlight}>
          <Text style={[styles.text, { fontSize: 9, fontWeight: 'bold', color: '#92400e' }]}>
            Deposit Required: ${quote.pricing.depositAmount.toFixed(2)} (15% of total)
          </Text>
          <Text style={[styles.text, { fontSize: 7, color: '#92400e' }]}>
            Deposit must be paid to secure your booking. Remaining balance due on charter date.
          </Text>
        </View>
      </View>

      {/* Compact Terms and Contact Info */}
      <View style={styles.compactTermsContainer}>
        <View style={styles.compactColumn}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 4 }]}>Terms</Text>
          <Text style={styles.smallText}>• Quote valid until expiration</Text>
          <Text style={styles.smallText}>• Deposit required to confirm</Text>
          <Text style={styles.smallText}>• Weather may affect scheduling</Text>
          <Text style={styles.smallText}>• Cancellation policy applies</Text>
        </View>
        
        <View style={styles.compactColumn}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 4 }]}>Contact</Text>
          <Text style={styles.smallText}>Phone: +1 (555) 123-BOAT</Text>
          <Text style={styles.smallText}>Email: quotes@kosyacht.com</Text>
          <Text style={styles.smallText}>Emergency: +1 (555) 911-BOAT</Text>
          <Text style={styles.smallText}>www.kosyachtcharter.com</Text>
        </View>
        
        {quote.notes && (
          <View style={styles.compactColumn}>
            <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 4 }]}>Notes</Text>
            <View style={[styles.specialRequestsBox, { padding: 4 }]}>
              <Text style={[styles.text, { fontSize: 7 }]}>{quote.notes}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ marginBottom: 2 }}>Thank you for choosing KOS Yacht Charter for your boating needs!</Text>
        <Text>We look forward to providing you with an exceptional charter experience.</Text>
      </View>
    </Page>
  </Document>
); 