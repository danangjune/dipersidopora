<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    public function increment()
    {
        $count = DB::transaction(function () {
            $row = DB::table('tb_counter')->where('id', 1)->lockForUpdate()->first();

            if (! $row) {
                DB::table('tb_counter')->insert([
                    'id' => 1,
                    'counts' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return 1;
            }

            $next = ((int) $row->counts) + 1;
            DB::table('tb_counter')->where('id', 1)->update([
                'counts' => $next,
                'updated_at' => now(),
            ]);

            return $next;
        });

        return response()->json(['status' => 'success', 'count' => (int) $count]);
    }
}
