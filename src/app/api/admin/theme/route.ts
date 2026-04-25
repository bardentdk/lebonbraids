import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 };
  }
  return { supabase };
}

export async function POST(request: Request) {
  const check = await requireAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await request.json();
  const { id, name, slug, config, isActive } = body;

  const supabase = check.supabase;

  if (id) {
    const { data, error } = await supabase
      .from('themes')
      .update({
        name,
        config,
        is_active: isActive,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('themes')
    .insert({ name, slug, config, is_active: isActive })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const check = await requireAdmin();
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = check.supabase;

  const { data: theme } = await supabase
    .from('themes')
    .select('is_active')
    .eq('id', id)
    .single();

  if (theme?.is_active) {
    return NextResponse.json(
      { error: 'Impossible de supprimer le thème actif' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('themes').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}