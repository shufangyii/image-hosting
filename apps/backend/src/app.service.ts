import { Injectable, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly supabaseService: SupabaseService) {}

  async onModuleInit() {
    // Test Supabase connection
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('non_existent_table')
        .select('*');
      if (error) {
        console.log(
          'Supabase connection test successful (expected error for non-existent table):',
          error.message,
        );
      } else {
        console.log(
          'Supabase connection test successful (unexpected data):',
          data,
        );
      }
    } catch (e) {
      console.error('Supabase connection test failed:', (e as Error).message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
