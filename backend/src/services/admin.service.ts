import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  createClient,
  Annotation,
  Tagged,
  type GolemBaseClient,
  type GolemBaseCreate,
} from 'golem-base-sdk';
import { Logger, ILogObj } from 'tslog';

@Injectable()
export class AdminService implements OnModuleInit {
  private client: GolemBaseClient;
  private readonly adminEmail = process.env.ADMIN_EMAIL || 'user@gmail.com';

  async onModuleInit() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x...';
    const privateKeyHex = PRIVATE_KEY.replace(/^0x/, '');
    const privateKey = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );

    const logger = new Logger<ILogObj>({ name: 'AdminService' });

    this.client = await createClient(
      60138453033,
      new Tagged('privatekey', privateKey),
      process.env.GOLEM_HTTP_URL || 'https://ethwarsaw.holesky.golemdb.io/rpc',
      process.env.GOLEM_WS_URL || 'wss://ethwarsaw.holesky.golemdb.io/rpc/ws',
      logger,
    );
  }

  async ensureAdminEntity(): Promise<string> {
    // Check if entity already exists
    const results = await this.client.queryEntities(
      `type = "admin" && email = "${this.adminEmail}"`,
    );
    if (results.length > 0) {
      return results[0].entityKey;
    }

    // Otherwise create new admin entity
    const entity: GolemBaseCreate = {
      data: new TextEncoder().encode(
        JSON.stringify({
          email: this.adminEmail,
          role: 'admin',
          createdAt: Date.now(),
        }),
      ),
      btl: 600, // ~20 minutes (extend as needed)
      stringAnnotations: [
        new Annotation('type', 'admin'),
        new Annotation('email', this.adminEmail),
      ],
      numericAnnotations: [new Annotation('version', 1)],
    };

    const receipts = await this.client.createEntities([entity]);
    return receipts[0].entityKey;
  }

  async isAdmin(email: string): Promise<boolean> {
    return email === this.adminEmail;
  }
}
