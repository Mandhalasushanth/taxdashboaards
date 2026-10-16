import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, DeferredContent, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useConversation } from '../../hooks/useConversation';
import { useStaffContacts } from '../../hooks/useStaffContacts';
import { CommunicationToolbar } from './CommunicationToolbar';
import { ContactList } from './ContactList';
import { ConversationPanel } from './ConversationPanel';
import './CommunicationSection.css';

const CONTACT_PARAM = 'contact';

/**
 * Admin "Communication": message any CA Manager, CA Agent, Loan Manager or Loan Agent.
 * Features a top role-segmented toolbar, left pane staff directory, and right pane conversation.
 * The open conversation lives in the URL (?contact=…), so it survives refresh and mobile back navigation.
 */
export default function CommunicationSection() {
  useDocumentTitle('Communication');
  const [searchParams, setSearchParams] = useSearchParams();
  const directory = useStaffContacts();
  const selectedId = searchParams.get(CONTACT_PARAM);
  const selected = directory.contacts.find((contact) => contact.id === selectedId) ?? null;
  const conversation = useConversation(selected, { onRead: directory.markReadLocally, onSent: directory.recordSent });

  const openContact = (contactId: string) => setSearchParams({ [CONTACT_PARAM]: contactId });
  const backToList = () => setSearchParams({}, { replace: true });

  const totalUnread = useMemo(
    () => directory.contacts.reduce((sum, contact) => sum + contact.unreadCount, 0),
    [directory.contacts]
  );

  if (directory.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-communication__state">
          <LoadingSpinner size="lg" label="Loading staff" />
        </div>
      </DeferredContent>
    );
  }

  if (directory.status === 'error') {
    return (
      <div className="tx-communication__state" role="alert">
        <p>{directory.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={directory.reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="tx-communication-page">
      <CommunicationToolbar
        roleFilter={directory.roleFilter}
        roleCounts={directory.roleCounts}
        unreadCount={totalUnread}
        onRoleFilterChange={directory.setRoleFilter}
      />
      <div className={selected ? 'tx-communication tx-communication--chat-open' : 'tx-communication'}>
        <ContactList directory={directory} selectedId={selected?.id ?? null} onSelect={openContact} />
        <ConversationPanel contact={selected} conversation={conversation} onBack={backToList} />
      </div>
    </div>
  );
}
