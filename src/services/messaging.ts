import { API_CONFIG } from '../config';
import api from './api';

export interface Topic {
  hashId: string;
  name: string;
  partitions: number;
  replicationFactor: number;
  retentionMs: number;
  createdAt: string;
}

export interface DLQEntry {
  id: string;
  topic: string;
  originalMessage: Record<string, unknown>;
  error: string;
  timestamp: string;
  retryCount: number;
}

export interface HealthStatus {
  status: string;
  broker: string;
  topics: number;
  uptime: number;
}

export interface BrokerPartition {
  partition: number;
  leader: number;
  replicas: number[];
  isr: number[];
  offset: number;
}

export interface BrokerTopic {
  name: string;
  partitions: number;
  replicationFactor: number;
  isInternal: boolean;
  messageCount: number;
  partitionDetails: BrokerPartition[];
}

export interface ConsumerGroupAssignment {
  topic: string;
  partition: number;
  currentOffset: number;
  logEndOffset: number;
  lag: number;
}

export interface BrokerConsumerGroup {
  groupId: string;
  state: string;
  protocol: string;
  protocolType: string;
  memberCount: number;
  members: Array<{ memberId: string; clientId: string; clientHost: string }>;
  assignments: ConsumerGroupAssignment[];
}

export interface BrokerDrift {
  inBrokerNotInRegistry: string[];
  inRegistryNotInBroker: string[];
  matched: string[];
}

export interface BrokerMessage {
  partition: number;
  offset: number;
  timestamp: string;
  key: string | null;
  value: unknown;
  valueIsJson: boolean;
  headers: Record<string, string>;
}

export interface BrokerMessagesResult {
  topic: string;
  totalMessages: number;
  returned: number;
  messages: BrokerMessage[];
  note?: string;
}

export const messagingService = {
  getTopics: () =>
    api.get<Topic[]>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/topics`),

  getDLQ: () =>
    api.get<DLQEntry[]>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/dlq`),

  getHealth: () =>
    api.get<HealthStatus>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/health`),

  getBrokerTopics: () =>
    api.get<BrokerTopic[]>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/broker/topics`),

  getBrokerConsumerGroups: () =>
    api.get<BrokerConsumerGroup[]>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/broker/consumer-groups`),

  getBrokerDrift: () =>
    api.get<BrokerDrift>(`${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/broker/drift`),

  getBrokerMessages: (topic: string, limit = 20) =>
    api.get<BrokerMessagesResult>(
      `${API_CONFIG.MESSAGING_URL}/api/v1/G/messaging/broker/topics/${encodeURIComponent(topic)}/messages?limit=${limit}`,
    ),
};
