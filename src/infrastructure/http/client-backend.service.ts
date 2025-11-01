import { Injectable } from '@nestjs/common';
import { Document } from '../../domain/entities/document.entity';

export interface ClientBackendResponse {
  accessCode: string;
}

@Injectable()
export class ClientBackendService {
  private readonly clientBackendUrl = 'https://api.client.on-track.ch/v1';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendDocument(_document: Document): Promise<ClientBackendResponse> {
    // TODO: Implement actual HTTP client call
    // For now, simulate the response
    return Promise.resolve({
      accessCode: this.generateMockAccessCode(),
    });
  }

  private generateMockAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
