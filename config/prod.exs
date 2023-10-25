import Config

# Do not print debug messages in production

config :logger, :console, level: :info

config :logger, :ecto,
  level: :info,
  path: Path.absname("logs/prod/ecto.log"),
  rotate: %{max_bytes: 1_048_576, keep: 1}

config :logger, :error,
  path: Path.absname("logs/prod/error.log"),
  rotate: %{max_bytes: 1_048_576, keep: 1}

config :logger, :account,
  level: :info,
  path: Path.absname("logs/prod/account.log"),
  rotate: %{max_bytes: 1_048_576, keep: 1},
  metadata_filter: [fetcher: :account]
