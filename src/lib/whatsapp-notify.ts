/**
 * Envia uma notificação de WhatsApp para o número do admin usando a Z-API
 * (https://z-api.io). A Z-API conecta a um número de WhatsApp comum via
 * QR Code (como o WhatsApp Web) e permite enviar mensagens de texto livre
 * por API — sem precisar de aprovação de conta comercial da Meta.
 *
 * Variáveis de ambiente necessárias (configure na Vercel):
 *   ZAPI_INSTANCE_ID        - ID da instância Z-API
 *   ZAPI_TOKEN              - token da instância Z-API
 *   ZAPI_CLIENT_TOKEN       - "client-token" de segurança da conta Z-API (opcional, mas recomendado)
 *   ADMIN_WHATSAPP_NUMBER   - número que deve receber os avisos, formato: 5551996767044 (só dígitos, com DDI 55 e DDD)
 *
 * Se qualquer variável estiver faltando, a função apenas loga um aviso e
 * não faz nada — assim nunca quebra o fluxo de pagamento por causa disso.
 */
export async function sendAdminWhatsAppNotification(message: string): Promise<void> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!instanceId || !token || !adminNumber) {
    console.warn('Notificação WhatsApp não enviada: variáveis ZAPI_INSTANCE_ID/ZAPI_TOKEN/ADMIN_WHATSAPP_NUMBER não configuradas.');
    return;
  }

  try {
    const res = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientToken ? { 'Client-Token': clientToken } : {}),
      },
      body: JSON.stringify({ phone: adminNumber, message }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Falha ao enviar notificação WhatsApp via Z-API:', res.status, text);
    }
  } catch (err) {
    console.error('Erro ao chamar a Z-API para notificação WhatsApp:', err);
  }
}
