import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDateTime, fmtMoney } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Invoice {
  id: string;
  invoice_number: string;
  patient: string;
  status: string;
  total: string;
  created_at: string;
}

interface Payment {
  id: string;
  invoice: string;
  amount: string;
  method: string;
  status: string;
  paid_at: string;
}

interface Patient { id: string; full_name: string }

export default function BillingPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ patient: '', invoice_number: '', total: '0', notes: '' });
  const [paymentForm, setPaymentForm] = useState({ invoice: '', patient: '', amount: '', method: 'cash' });

  const load = useCallback(() => {
    apiClient.get('/staff/invoices/').then((res) => setInvoices(unwrapList(res.data)));
    apiClient.get('/staff/payments/').then((res) => setPayments(unwrapList(res.data)));
  }, []);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((res) => setPatients(unwrapList(res.data)));
  }, [load]);

  const createInvoice = async () => {
    await apiClient.post('/staff/invoices/', {
      ...invoiceForm,
      subtotal: invoiceForm.total,
      status: 'draft',
    });
    setOpenInvoice(false);
    load();
  };

  const createPayment = async () => {
    await apiClient.post('/staff/payments/', paymentForm);
    setOpenPayment(false);
    load();
  };

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('nav.billing')}
        subtitle={t('billing.subtitle')}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => setOpenInvoice(true)}>{t('billing.newInvoice')}</Button>
            <Button variant="outlined" onClick={() => setOpenPayment(true)}>{t('billing.newPayment')}</Button>
          </Stack>
        }
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('billing.invoices')} />
        <Tab label={t('billing.payments')} />
      </Tabs>

      {tab === 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.invoiceNumber')}</TableCell>
                <TableCell>{t('billing.amount')}</TableCell>
                <TableCell>{t('appointments.status')}</TableCell>
                <TableCell>{t('prescriptions.date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={4}><EmptyState message={t('billing.emptyInvoices')} /></TableCell></TableRow>
              ) : invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.invoice_number}</TableCell>
                  <TableCell>{fmtMoney(inv.total)}</TableCell>
                  <TableCell><StatusChip status={inv.status} namespace="billing.statuses" /></TableCell>
                  <TableCell>{fmtDateTime(inv.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.amount')}</TableCell>
                <TableCell>{t('billing.method')}</TableCell>
                <TableCell>{t('appointments.status')}</TableCell>
                <TableCell>{t('billing.paidAt')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={4}><EmptyState message={t('billing.emptyPayments')} /></TableCell></TableRow>
              ) : payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{fmtMoney(p.amount)}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell><StatusChip status={p.status} namespace="billing.paymentStatuses" /></TableCell>
                  <TableCell>{fmtDateTime(p.paid_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={openInvoice} onClose={() => setOpenInvoice(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('billing.newInvoice')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('patients.name')} value={invoiceForm.patient}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, patient: e.target.value })} fullWidth>
              {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
            </TextField>
            <TextField label={t('billing.invoiceNumber')} value={invoiceForm.invoice_number}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} fullWidth />
            <TextField type="number" label={t('billing.amount')} value={invoiceForm.total}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, total: e.target.value })} fullWidth />
            <TextField label={t('billing.notes')} value={invoiceForm.notes}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} fullWidth multiline />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvoice(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={createInvoice}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPayment} onClose={() => setOpenPayment(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('billing.newPayment')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('billing.invoice')} value={paymentForm.invoice}
              onChange={(e) => setPaymentForm({ ...paymentForm, invoice: e.target.value })} fullWidth>
              {invoices.map((inv) => <MenuItem key={inv.id} value={inv.id}>{inv.invoice_number}</MenuItem>)}
            </TextField>
            <TextField select label={t('patients.name')} value={paymentForm.patient}
              onChange={(e) => setPaymentForm({ ...paymentForm, patient: e.target.value })} fullWidth>
              {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
            </TextField>
            <TextField type="number" label={t('billing.amount')} value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} fullWidth />
            <TextField label={t('billing.method')} value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayment(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={createPayment}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
