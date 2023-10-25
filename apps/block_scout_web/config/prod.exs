import Config

# For production, we often load configuration from external
# sources, such as your system environment. For this reason,
# you won't find the :http configuration below, but set inside
# BlockScoutWeb.Endpoint.init/2 when load_from_system_env is
# true. Any dynamic configuration should be done there.
#
# Don't forget to configure the url host to something meaningful,
# Phoenix uses this information when generating URLs.
#
# Finally, we also include the path to a cache manifest
# containing the digested version of static files. This
# manifest is generated by the mix phx.digest task
# which you typically run after static files are built.
config :block_scout_web, BlockScoutWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  force_ssl: false

config :block_scout_web, BlockScoutWeb.Tracer, env: "production", disabled?: true

config :logger, :block_scout_web,
  level: :info,
  path: Path.absname("logs/prod/block_scout_web.log"),
  rotate: %{max_bytes: 1_048_576, keep: 1}

config :logger, :api,
  level: :debug,
  path: Path.absname("logs/prod/api.log"),
  metadata_filter: [application: :api],
  rotate: %{max_bytes: 1_048_576, keep: 1}

config :logger, :api_v2,
  level: :debug,
  path: Path.absname("logs/prod/api_v2.log"),
  metadata_filter: [application: :api_v2],
  rotate: %{max_bytes: 1_048_576, keep: 1}

config :block_scout_web, :captcha_helper, BlockScoutWeb.CaptchaHelper
