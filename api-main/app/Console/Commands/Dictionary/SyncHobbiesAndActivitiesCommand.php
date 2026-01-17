<?php

namespace App\Console\Commands\Dictionary;

use App\Models\Dictionary\Activity;
use App\Models\Dictionary\Hobby;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

final class SyncHobbiesAndActivitiesCommand extends Command
{
    protected $signature = 'dictionary:sync-hobbies-activities';

    protected $description = 'Sync hobbies and activities';

    private const array HOBBIES = [
        ["id" => "1", "title" => "reading", "emoji" => "📚"],
        ["id" => "2", "title" => "cooking", "emoji" => "👨‍🍳"],
        ["id" => "3", "title" => "gardening", "emoji" => "🌱"],
        ["id" => "4", "title" => "painting", "emoji" => "🎨"],
        ["id" => "5", "title" => "photography", "emoji" => "📸"],
        ["id" => "6", "title" => "hiking", "emoji" => "⛺️"],
        ["id" => "7", "title" => "swimming", "emoji" => "🏊"],
        ["id" => "8", "title" => "cycling", "emoji" => "🚴"],
        ["id" => "9", "title" => "knitting", "emoji" => "🧵"],
        ["id" => "10", "title" => "writing", "emoji" => "✍️"],
        ["id" => "11", "title" => "drawing", "emoji" => "✏️"],
        ["id" => "12", "title" => "fishing", "emoji" => "🎣"],
        ["id" => "13", "title" => "dancing", "emoji" => "💃"],
        ["id" => "14", "title" => "singing", "emoji" => "🎤"],
        ["id" => "15", "title" => "gaming", "emoji" => "🎮"],
        ["id" => "16", "title" => "traveling", "emoji" => "🛫"],
        ["id" => "17", "title" => "collecting", "emoji" => "🪙"],
        ["id" => "18", "title" => "woodworking", "emoji" => "🪚"],
        ["id" => "19", "title" => "pottery", "emoji" => "🏺"],
        ["id" => "20", "title" => "meditation", "emoji" => "🕯️"],
        ["id" => "21", "title" => "fitness", "emoji" => "💪"],
        ["id" => "22", "title" => "music", "emoji" => "🎸"],
        ["id" => "23", "title" => "cinema", "emoji" => "🎬"],
        ["id" => "24", "title" => "astrology", "emoji" => "🔮"],
        ["id" => "25", "title" => "skateboarding", "emoji" => "🛹"],
        ["id" => "26", "title" => "coffee", "emoji" => "☕️"],
        ["id" => "27", "title" => "psychology", "emoji" => "🧠"],
        ["id" => "28", "title" => "fashion", "emoji" => "💎"],
        ["id" => "29", "title" => "parties", "emoji" => "🎉"],
        ["id" => "30", "title" => "technology", "emoji" => "💻"],
        ["id" => "31", "title" => "yoga", "emoji" => "🧘‍♀️"],
        ["id" => "32", "title" => "auto", "emoji" => "🚘"],
        ["id" => "33", "title" => "streaming", "emoji" => "📺"],
        ["id" => "34", "title" => "podcasts", "emoji" => "🎧"],
        ["id" => "35", "title" => "pets", "emoji" => "🐶"],
        ["id" => "36", "title" => "diy", "emoji" => "🛠️"],
        ["id" => "37", "title" => "anime", "emoji" => "🇯🇵"],
        ["id" => "38", "title" => "roleplay", "emoji" => "🎭"],
        ["id" => "39", "title" => "languages", "emoji" => "🗣️"],
        ["id" => "40", "title" => "volunteering", "emoji" => "🦮"],
        ["id" => "41", "title" => "boardgames", "emoji" => "🧩"],
    ];

    private const array ACTIVITIES = [
        ["id" => "1", "title" => "it", "emoji" => "💻"],
        ["id" => "71", "title" => "engineering", "emoji" => "⚙️"],
        ["id" => "2", "title" => "medicine", "emoji" => "🏥"],
        ["id" => "42", "title" => "fashion_industry", "emoji" => "👜"],
        ["id" => "12", "title" => "sales_and_customer_service", "emoji" => "🛒"],
        ["id" => "5", "title" => "automotive", "emoji" => "🚗"],
        ["id" => "45", "title" => "finance_and_investments", "emoji" => "🏦"],
        ["id" => "43", "title" => "show_business", "emoji" => "🌟"],
        ["id" => "44", "title" => "blogging", "emoji" => "📱"],
        ["id" => "3", "title" => "education", "emoji" => "🎓"],
        ["id" => "51", "title" => "service_industry", "emoji" => "🛎️"],
        ["id" => "56", "title" => "government_services", "emoji" => "🛡️"],
        ["id" => "83", "title" => "real_estate", "emoji" => "🏠"],
        ["id" => "46", "title" => "marketing", "emoji" => "📊"],
        ["id" => "150", "title" => "modeling", "emoji" => "👠"],
        ["id" => "97", "title" => "sports", "emoji" => "🚴"],
        ["id" => "15", "title" => "media_and_communications", "emoji" => "📡"],
        ["id" => "81", "title" => "travel_and_tourism", "emoji" => "✈️"],
        ["id" => "200", "title" => "gaming_industry", "emoji" => "🎮"],
        ["id" => "18", "title" => "art", "emoji" => "🎨"],
        ["id" => "14", "title" => "music", "emoji" => "🎵"],
        ["id" => "9", "title" => "law", "emoji" => "⚖️"],
        ["id" => "201", "title" => "science", "emoji" => ""],
        ["id" => "202", "title" => "agro", "emoji" => ""],
    ];

    public function handle(): int
    {
        $this->info('Start');
        $this->newLine();

        try {
            DB::transaction(function () {
                $this->syncHobbies();
                $this->syncActivities();
            });

            $this->newLine();
            $this->info('Success');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    private function syncHobbies(): void
    {
        $this->info('Hobbies');
        $added = 0;
        $skipped = 0;

        foreach (self::HOBBIES as $hobbyData) {
            $existing = Hobby::query()->where('title', $hobbyData['title'])->first();

            if ($existing !== null) {
                $skipped++;
                $this->line("   Skipped: {$hobbyData['title']}");
                continue;
            }

            Hobby::query()->create([
                'title' => $hobbyData['title'],
                'emoji' => $hobbyData['emoji'] ?? null,
            ]);

            $added++;
            $this->line("   Added: {$hobbyData['title']} {$hobbyData['emoji']}");
        }

        $this->info("  Added: {$added}, skipped {$skipped}");
        $this->newLine();
    }

    private function syncActivities(): void
    {
        $this->info('Sync activities...');
        $added = 0;
        $skipped = 0;

        foreach (self::ACTIVITIES as $activityData) {
            $existing = Activity::query()->where('title', $activityData['title'])->first();

            if ($existing !== null) {
                $skipped++;
                $this->line("   Skipped: {$activityData['title']}");
                continue;
            }

            $data = ['title' => $activityData['title']];
            $data['emoji'] = !empty($activityData['emoji']) ? $activityData['emoji'] : null;

            Activity::query()->create($data);

            $added++;
            $emoji = !empty($activityData['emoji']) ? $activityData['emoji'] : '(без emoji)';
            $this->line("   Added: {$activityData['title']} {$emoji}");
        }

        $this->info("   Added: {$added}, skipped {$skipped}");
        $this->newLine();
    }
}
